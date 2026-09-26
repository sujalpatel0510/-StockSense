import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Scale,
  History,
  Settings,
  Building2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Boxes,
  User,
  LogOut,
  Bell,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Warehouse } from '../types';
import { ActiveTab } from './Navbar';
export type { ActiveTab };

interface NavigationItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeVariant?: 'warning' | 'info' | 'success' | 'purple' | 'orange';
  href: string;
}

interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

const navigationConfig: NavigationGroup[] = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, href: '/dashboard' },
    ],
  },
  {
    group: 'Inventory Assets',
    items: [
      { id: 'products', label: 'Products', icon: Package, badge: null, href: '/products' },
      { id: 'moves', label: 'Move History', icon: History, badge: null, href: '/moves' },
    ],
  },
  {
    group: 'Operations Logistics',
    items: [
      { id: 'receipts', label: 'Receipts', icon: ArrowDownLeft, badge: 'WH/IN', badgeVariant: 'info', href: '/transfers/receipts' },
      { id: 'deliveries', label: 'Deliveries', icon: ArrowUpRight, badge: 'WH/OUT', badgeVariant: 'success', href: '/transfers/deliveries' },
      { id: 'internal', label: 'Internal Transfers', icon: ArrowLeftRight, badge: 'WH/INT', badgeVariant: 'purple', href: '/transfers/internal' },
    ],
  },
  {
    group: 'Audit & Reconciliation',
    items: [
      { id: 'adjustments', label: 'Adjustments', icon: Scale, badge: 'WH/ADJ', badgeVariant: 'orange', href: '/adjustments' },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { id: 'settings', label: 'Warehouses & Locations', icon: Settings, badge: null, href: '/settings' },
    ],
  },
];

const mobilePrimaryItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'products', label: 'Products', icon: Package, href: '/products' },
  { id: 'receipts', label: 'Receipts', icon: ArrowDownLeft, href: '/transfers/receipts' },
  { id: 'deliveries', label: 'Deliveries', icon: ArrowUpRight, href: '/transfers/deliveries' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onTabSelect: (tab: ActiveTab) => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (id: string) => void;
  lowStockCount: number;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabSelect,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  lowStockCount,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleTabClick = (tab: ActiveTab) => {
    onTabSelect(tab);
    const item = navigationConfig.flatMap((g) => g.items).find((i) => i.id === tab);
    if (item) navigate(item.href);
    if (isOpen) onClose();
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onWarehouseChange(e.target.value);
  };

  const handleLogout = () => {
    if (isOpen) onClose();
    logout();
  };

  const renderBadge = (item: NavigationItem, isActive: boolean) => {
    if (item.id === 'products' && lowStockCount > 0) {
      return (
        <span
          className={clsx(
            'font-mono text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1',
            isActive
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}
        >
          <span className={clsx('w-1.5 h-1.5 rounded-full', isActive ? 'bg-white' : 'bg-amber-500 animate-pulse')} />
          {lowStockCount} Low
        </span>
      );
    }

    if (item.badge) {
      if (isActive) {
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30">
            {item.badge}
          </span>
        );
      }

      switch (item.badgeVariant) {
        case 'info':
          return (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
              {item.badge}
            </span>
          );
        case 'success':
          return (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {item.badge}
            </span>
          );
        case 'purple':
          return (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              {item.badge}
            </span>
          );
        case 'orange':
          return (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
              {item.badge}
            </span>
          );
        default:
          return (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {item.badge}
            </span>
          );
      }
    }

    return null;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen || !collapsed ? 0 : -280 }}
        exit={{ x: -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={clsx(
          'fixed top-0 bottom-0 max-lg:bottom-16 left-0 z-50 flex flex-col bg-white border-r border-slate-200/90 shadow-xs select-none',
          'transition-all duration-200 lg:translate-x-0 h-screen',
          collapsed ? 'w-[76px]' : 'w-[276px]'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className={clsx('flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-slate-50/50', collapsed && 'justify-center px-2')}>
            <div
              className={clsx('flex items-center gap-3 cursor-pointer group', collapsed && 'justify-center')}
              onClick={() => handleTabClick('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">
                      StockSense
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-1 py-0.2 rounded">
                      PRO
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Enterprise IMS
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={clsx(
                'hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex-shrink-0 cursor-pointer',
                collapsed && 'hidden'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Active Facility / Warehouse Selector */}
          {!collapsed && (
            <div className="p-3 border-b border-slate-200/80 bg-slate-50/40">
              <label
                htmlFor="warehouse-select"
                className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  Active Facility
                </span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </label>
              <div className="relative">
                <select
                  id="warehouse-select"
                  value={selectedWarehouseId}
                  onChange={handleWarehouseChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs transition-all appearance-none"
                >
                  <option value="">🏢 Enterprise (All Warehouses)</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.code} · {wh.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4" aria-label="Main menu">
            {navigationConfig.map((group) => (
              <div key={group.group} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    {group.group}
                  </div>
                )}
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600',
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        collapsed ? 'justify-center px-0' : 'text-left justify-start'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={clsx('flex-shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')}>
                        <Icon className="w-4.5 h-4.5" />
                      </span>
                      {!collapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {!collapsed && renderBadge(item, isActive)}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Section & Sign Out Footer */}
          <div className="p-3 border-t border-slate-200/90 bg-slate-50/70 mt-auto">
            <div
              className={clsx(
                'flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs cursor-pointer hover:border-slate-300 transition-all group',
                collapsed && 'justify-center p-1.5'
              )}
              onClick={onOpenProfile}
              title="Click to view profile & settings"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {user?.fullName || 'Enterprise User'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono font-medium truncate uppercase tracking-tight">
                    {user?.role?.replace('_', ' ') || 'STAFF'}
                  </p>
                </div>
              )}
              {!collapsed && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              )}
            </div>

            {/* High-Impact Working Sign Out Button */}
            {!collapsed ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/90 active:scale-[0.98] border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Sign out of StockSense"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full flex items-center justify-center p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

interface TopBarProps {
  activeTab: ActiveTab;
  onTabSelect: (tab: ActiveTab) => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (id: string) => void;
  lowStockCount: number;
  onOpenSidebar: () => void;
  onOpenProfile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabSelect,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  lowStockCount,
  onOpenSidebar,
  onOpenProfile,
  onRefresh,
  isRefreshing,
}) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const currentGroup = navigationConfig.find((g) => g.items.some((i) => i.id === activeTab));
  const currentItem = currentGroup?.items.find((i) => i.id === activeTab);

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onWarehouseChange(e.target.value);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  const handleProfileAction = (action: 'profile' | 'logout') => {
    setProfileOpen(false);
    if (action === 'profile') {
      onOpenProfile();
    } else {
      handleLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Crisp Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>{currentGroup?.group || 'Overview'}</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">{currentItem?.label || 'Dashboard'}</span>
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {currentItem?.label || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right Controls: Facility Filter, Live Sync, Low Stock, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Warehouse Selector (Desktop Quick Switch) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <select
            value={selectedWarehouseId}
            onChange={handleWarehouseChange}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.code} · {wh.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Sync / Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          title="Refresh latest stock records from PostgreSQL"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5 text-indigo-600', isRefreshing && 'animate-spin')} />
          <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Low Stock Alert Badge Button */}
        {lowStockCount > 0 && (
          <button
            type="button"
            onClick={() => onTabSelect('products')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold transition-all hover:bg-amber-100 cursor-pointer shadow-2xs"
            title={`${lowStockCount} items below safety threshold`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{lowStockCount} Low Stock</span>
            <span className="sm:hidden">{lowStockCount}</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label="System notifications"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Operational Alerts</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold">Real-Time</span>
              </div>
              <div className="py-2 space-y-2">
                {lowStockCount > 0 ? (
                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      onTabSelect('products');
                    }}
                    className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs cursor-pointer hover:bg-amber-100/80 transition-colors"
                  >
                    <p className="font-bold">⚠️ Reordering Alert</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {lowStockCount} product(s) dropped below minimum safety threshold.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-1 text-center">All inventory stock levels are healthy.</p>
                )}
                <div
                  onClick={() => {
                    setNotificationsOpen(false);
                    onTabSelect('moves');
                  }}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <p className="font-semibold text-slate-900">📦 Ledger Active</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Audit trail synchronizing live moves.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`}
              alt="Avatar"
              className="w-7 h-7 rounded-md object-cover border border-slate-200"
            />
            <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
              {user?.fullName?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
              role="menu"
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleProfileAction('profile')}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  role="menuitem"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleProfileAction('logout')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabSelect: (tab: ActiveTab) => void;
  lowStockCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabSelect,
  lowStockCount,
}) => {
  const navigate = useNavigate();

  const handleTabClick = (item: NavigationItem) => {
    onTabSelect(item.id);
    navigate(item.href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-xl" aria-label="Bottom navigation">
      <div className="grid grid-cols-5">
        {mobilePrimaryItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item)}
              className={clsx(
                'flex flex-col items-center justify-center py-2 px-1 gap-1 transition-colors cursor-pointer',
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className="relative" aria-hidden="true">
                <Icon className={clsx('w-5 h-5', isActive ? 'text-indigo-600' : 'text-slate-500')} />
                {item.id === 'products' && lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};