import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';
import { ToastProvider } from './components/ui';
import { Sidebar, TopBar, MobileBottomNav } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import {
  DashboardStats,
  Product,
  ProductCategory,
  Warehouse,
  Location,
  OperationTransfer,
  StockMove,
} from './types';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const TransfersPage = lazy(() => import('./pages/TransfersPage').then(m => ({ default: m.TransfersPage })));
const AdjustmentsPage = lazy(() => import('./pages/AdjustmentsPage').then(m => ({ default: m.AdjustmentsPage })));
const MoveHistoryPage = lazy(() => import('./pages/MoveHistoryPage').then(m => ({ default: m.MoveHistoryPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

export type ActiveTab = 'dashboard' | 'products' | 'receipts' | 'deliveries' | 'internal' | 'adjustments' | 'moves' | 'settings';

const LoadingFallback = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-body text-text-muted">Loading StockSense...</p>
    </div>
  </div>
);

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return <>{children}</>;
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
      <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
      <Route path="/products/new" element={<PageWrapper><ProductsPage /></PageWrapper>} />
      <Route path="/products/:id" element={<PageWrapper><ProductsPage /></PageWrapper>} />
      <Route path="/transfers/receipts" element={<PageWrapper><TransfersPage type="RECEIPT" /></PageWrapper>} />
      <Route path="/transfers/deliveries" element={<PageWrapper><TransfersPage type="DELIVERY" /></PageWrapper>} />
      <Route path="/transfers/internal" element={<PageWrapper><TransfersPage type="INTERNAL" /></PageWrapper>} />
      <Route path="/transfers/:id" element={<PageWrapper><TransfersPage type="RECEIPT" /></PageWrapper>} />
      <Route path="/adjustments" element={<PageWrapper><AdjustmentsPage /></PageWrapper>} />
      <Route path="/adjustments/:id" element={<PageWrapper><AdjustmentsPage /></PageWrapper>} />
      <Route path="/moves" element={<PageWrapper><MoveHistoryPage /></PageWrapper>} />
      <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
      <Route path="/settings/warehouses" element={<PageWrapper><SettingsPage /></PageWrapper>} />
      <Route path="/settings/locations" element={<PageWrapper><SettingsPage /></PageWrapper>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const data = useData();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { 
    selectedWarehouseId, 
    setSelectedWarehouseId, 
    fetchAllData, 
    loading: dataLoading,
    lowStockCount 
  } = data;

  // Sync active tab state with current route pathname
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '');
    if (path === 'dashboard' || path === '') {
      setActiveTab('dashboard');
    } else if (path.startsWith('products')) {
      setActiveTab('products');
    } else if (path === 'transfers/receipts') {
      setActiveTab('receipts');
    } else if (path === 'transfers/deliveries') {
      setActiveTab('deliveries');
    } else if (path === 'transfers/internal') {
      setActiveTab('internal');
    } else if (path.startsWith('adjustments')) {
      setActiveTab('adjustments');
    } else if (path === 'moves') {
      setActiveTab('moves');
    } else if (path.startsWith('settings')) {
      setActiveTab('settings');
    }
  }, [location.pathname]);

  // Tab switching with instant URL routing
  const handleSelectTab = useCallback((newTab: ActiveTab) => {
    setActiveTab(newTab);
    const routes: Record<ActiveTab, string> = {
      dashboard: '/dashboard',
      products: '/products',
      receipts: '/transfers/receipts',
      deliveries: '/transfers/deliveries',
      internal: '/transfers/internal',
      adjustments: '/adjustments',
      moves: '/moves',
      settings: '/settings',
    };
    navigate(routes[newTab] || '/dashboard');
  }, [navigate]);

  if (authLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabSelect={handleSelectTab}
        warehouses={data.warehouses}
        selectedWarehouseId={selectedWarehouseId}
        onWarehouseChange={setSelectedWarehouseId}
        lowStockCount={lowStockCount}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:pl-[280px]">
        <TopBar
          activeTab={activeTab}
          onTabSelect={handleSelectTab}
          warehouses={data.warehouses}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseChange={setSelectedWarehouseId}
          lowStockCount={lowStockCount}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onRefresh={fetchAllData}
          isRefreshing={dataLoading}
        />

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6">
          <AppRoutes />
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        onTabSelect={handleSelectTab}
        lowStockCount={lowStockCount}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <ToastProvider>
          <AuthProvider>
            <AuthGuard>
              <AppContent />
            </AuthGuard>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}