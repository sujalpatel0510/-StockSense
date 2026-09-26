import React from 'react';
import { Menu, Search, AlertTriangle, Building2, User, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Warehouse } from '../types';
import { ActiveTab } from './Navbar';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  lowStockCount: number;
  onOpenMobileSidebar: () => void;
  onOpenProfile: () => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  warehouses,
  selectedWarehouseId,
  lowStockCount,
  onOpenMobileSidebar,
  onOpenProfile,
  searchTerm,
  setSearchTerm,
}) => {
  const { user } = useAuth();

  const getPageMeta = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Overview', section: 'Overview' };
      case 'products':
        return { title: 'Products & Stock Assets', section: 'Stock' };
      case 'receipts':
        return { title: 'Incoming Goods Receipts', section: 'Operations' };
      case 'deliveries':
        return { title: 'Delivery Dispatch Orders', section: 'Operations' };
      case 'internal':
        return { title: 'Internal Warehouse Moves', section: 'Operations' };
      case 'adjustments':
        return { title: 'Physical Count Audits', section: 'Audit' };
      case 'moves':
        return { title: 'Stock Ledger (Audit Trail)', section: 'Governance' };
      case 'settings':
        return { title: 'Warehouses & Locations', section: 'Configuration' };
    }
  };

  const meta = getPageMeta(activeTab);
  const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{meta.section}</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">{meta.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick Search, Facility status, Low-stock trigger & Profile */}
      <div className="flex items-center space-x-3">
        {/* Active Facility Tag */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>{selectedWh ? selectedWh.code : 'All Warehouses'}</span>
        </div>

        {/* Low Stock Alert Button */}
        {lowStockCount > 0 && (
          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition"
            title={`${lowStockCount} items below safety threshold`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{lowStockCount} Low Stock</span>
            <span className="sm:hidden">{lowStockCount}</span>
          </button>
        )}

        {/* Profile Avatar Trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition border border-slate-200/80"
        >
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`
            }
            alt="Avatar"
            className="w-7 h-7 rounded-md object-cover"
          />
          <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[120px] truncate">
            {user?.fullName?.split(' ')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
