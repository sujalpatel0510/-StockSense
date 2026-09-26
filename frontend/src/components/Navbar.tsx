import React, { useState } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  History,
  Settings,
  ChevronDown,
  LogOut,
  User,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Warehouse } from '../types';

export type ActiveTab = 'dashboard' | 'products' | 'receipts' | 'deliveries' | 'internal' | 'adjustments' | 'moves' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  lowStockCount: number;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  warehouses,
  selectedWarehouseId,
  setSelectedWarehouseId,
  lowStockCount,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isOperationActive = ['receipts', 'deliveries', 'internal', 'adjustments'].includes(activeTab);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded text-xs">Admin</span>;
      case 'INVENTORY_MANAGER':
        return <span className="bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded text-xs">Manager</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded text-xs">Staff</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#714B67] text-white shadow-md border-b border-[#5f3d56] w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-6">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="bg-white/10 p-1.5 rounded-lg border border-white/20 group-hover:bg-white/20 transition">
                <Boxes className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  StockSense
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded uppercase tracking-wider font-semibold border border-emerald-400/30">
                    IMS
                  </span>
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-black/25 text-white shadow-inner'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-200" />
                <span>Dashboard</span>
              </button>

              {/* Products */}
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'products'
                    ? 'bg-black/25 text-white shadow-inner'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 text-purple-200" />
                <span>Products</span>
              </button>

              {/* Operations Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOperationsOpen(!operationsOpen)}
                  onBlur={() => setTimeout(() => setOperationsOpen(false), 200)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                    isOperationActive
                      ? 'bg-black/25 text-white shadow-inner'
                      : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4 text-purple-200" />
                  <span>Operations</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${operationsOpen ? 'rotate-180' : ''}`} />
                </button>

                {operationsOpen && (
                  <div className="absolute left-0 mt-1 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Inventory Logistics
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('receipts');
                        setOperationsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                        activeTab === 'receipts' ? 'bg-purple-50 text-purple-900 font-semibold' : ''
                      }`}
                    >
                      <span>Receipts (Incoming Goods)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">WH/IN</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('deliveries');
                        setOperationsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                        activeTab === 'deliveries' ? 'bg-purple-50 text-purple-900 font-semibold' : ''
                      }`}
                    >
                      <span>Delivery Orders (Outgoing)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono">WH/OUT</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('internal');
                        setOperationsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                        activeTab === 'internal' ? 'bg-purple-50 text-purple-900 font-semibold' : ''
                      }`}
                    >
                      <span>Internal Transfers</span>
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono">WH/INT</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Audit & Reconciliation
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('adjustments');
                        setOperationsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                        activeTab === 'adjustments' ? 'bg-purple-50 text-purple-900 font-semibold' : ''
                      }`}
                    >
                      <span>Inventory Adjustments</span>
                      <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-mono">WH/ADJ</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Move History / Stock Ledger */}
              <button
                onClick={() => setActiveTab('moves')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'moves'
                    ? 'bg-black/25 text-white shadow-inner'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <History className="w-4 h-4 text-purple-200" />
                <span>Move History</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-black/25 text-white shadow-inner'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-200" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Right Section: Warehouse Selector & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Warehouse Filter */}
            <div className="hidden sm:flex items-center bg-black/20 rounded-md px-2.5 py-1 border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-purple-200 mr-1.5" />
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="text-slate-800">
                  🏢 All Warehouses
                </option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id} className="text-slate-800">
                    {wh.code} - {wh.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Alert Button */}
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('products')}
                title={`${lowStockCount} items below minimum safety threshold`}
                className="flex items-center space-x-1 px-2.5 py-1 bg-amber-400 text-slate-900 rounded-md text-xs font-bold shadow hover:bg-amber-300 transition animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-950" />
                <span>{lowStockCount} Low Stock</span>
              </button>
            )}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 250)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-full hover:bg-white/10 transition border border-white/10"
              >
                <img
                  src={
                    user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`
                  }
                  alt="avatar"
                  className="w-7 h-7 rounded-full border border-white/40 object-cover"
                />
                <span className="hidden md:inline text-xs font-semibold text-white max-w-[120px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-purple-200" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      {getRoleBadge(user?.role)}
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Online
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
