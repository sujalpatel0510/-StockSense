import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Scale,
  History,
  Settings,
  Boxes,
  Building2,
  AlertTriangle,
  LogOut,
  User,
  ChevronRight,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Warehouse } from '../types';
import { ActiveTab } from './Navbar';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  lowStockCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  warehouses,
  selectedWarehouseId,
  setSelectedWarehouseId,
  lowStockCount,
  isOpenMobile,
  setIsOpenMobile,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | null;
    badgeVariant?: 'warning' | 'default';
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      group: 'Core Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      group: 'Inventory Assets',
      items: [
        {
          id: 'products',
          label: 'Products Catalog',
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
          badgeVariant: 'warning',
        },
        { id: 'moves', label: 'Move History (Ledger)', icon: History, badge: null },
      ],
    },
    {
      group: 'Operations Logistics',
      items: [
        { id: 'receipts', label: 'Receipts (Incoming)', icon: ArrowDownLeft, badge: 'WH/IN' },
        { id: 'deliveries', label: 'Delivery Orders', icon: ArrowUpRight, badge: 'WH/OUT' },
        { id: 'internal', label: 'Internal Transfers', icon: ArrowLeftRight, badge: 'WH/INT' },
      ],
    },
    {
      group: 'Audit & Governance',
      items: [
        { id: 'adjustments', label: 'Physical Adjustments', icon: Scale, badge: null },
        { id: 'settings', label: 'Warehouses & Locations', icon: Settings, badge: null },
      ],
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId as ActiveTab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B0F19] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding & Warehouse Switcher */}
        <div>
          {/* Header Brand */}
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 p-1.5 flex items-center justify-center shadow-md shadow-indigo-950/50">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  StockSense
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.2 rounded border border-indigo-400/20 font-bold">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">Inventory Enterprise</span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Facility / Warehouse Picker */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>Active Facility Filter</span>
            </label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="">🏢 Enterprise (All Warehouses)</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} · {wh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            item.badgeVariant === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div
              onClick={onOpenProfile}
              className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0 mr-2 group"
            >
              <img
                src={
                  user?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`
                }
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover border border-slate-700 group-hover:border-indigo-400 transition"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-indigo-300 transition">
                  {user?.fullName}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
