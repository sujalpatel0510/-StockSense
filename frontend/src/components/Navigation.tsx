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
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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

// Interactive Animated Warehouse Operations Graphic & Telemetry Hub
const WarehouseOperationsWidget: React.FC<{
  onExplore: () => void;
  collapsed: boolean;
}> = ({ onExplore, collapsed }) => {
  if (collapsed) {
    return (
      <div
        onClick={onExplore}
        className="mx-2 my-2 p-2 rounded-xl bg-gradient-to-b from-indigo-50/80 to-purple-50/50 border border-indigo-100 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-all group"
        title="Double-Entry Logistics Engine (Active)"
      >
        <div className="relative">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Boxes className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          </motion.div>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 my-3 p-3 rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 shadow-lg shadow-indigo-950/20 text-white relative overflow-hidden group select-none">
      {/* Background ambient lighting glows */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/25 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/25 rounded-full blur-xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Ops Engine Live
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold text-indigo-200 bg-indigo-900/80 border border-indigo-600/50 px-1.5 py-0.5 rounded shadow-2xs">
          Double-Entry
        </span>
      </div>

      {/* Animated Isometric Warehouse Graphic (Interactive SVG) */}
      <div 
        onClick={onExplore}
        className="relative h-28 flex items-center justify-center overflow-hidden my-1 rounded-xl bg-slate-950/70 border border-indigo-800/40 cursor-pointer shadow-inner"
        title="Double-Entry Real-time Warehouse Inventory Sync"
      >
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="cubeLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id="cubeRight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="scanBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Perspective Warehouse Floor Grid */}
          <g opacity="0.35">
            <line x1="100" y1="75" x2="30" y2="115" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="100" y1="75" x2="170" y2="115" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="100" y1="75" x2="100" y2="118" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="60" y1="92" x2="130" y2="52" stroke="#4f46e5" strokeWidth="0.8" />
            <line x1="45" y1="101" x2="145" y2="44" stroke="#4f46e5" strokeWidth="0.8" />
            <line x1="75" y1="60" x2="155" y2="106" stroke="#4f46e5" strokeWidth="0.8" />
            <line x1="55" y1="71" x2="135" y2="117" stroke="#4f46e5" strokeWidth="0.8" />
          </g>

          {/* Ground Radar Pulse Wave Ring */}
          <motion.ellipse
            cx="100"
            cy="90"
            rx="36"
            ry="16"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            animate={{
              scale: [0.75, 1.25, 0.75],
              opacity: [0.55, 0.15, 0.55],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '100px 90px' }}
          />

          {/* Isometric Warehouse Storage Rack (Left) */}
          <path
            d="M 32,45 L 32,85 L 56,98 L 56,58 Z"
            fill="#1e1b4b"
            fillOpacity="0.5"
            stroke="#4338ca"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />
          <line x1="32" y1="58" x2="56" y2="71" stroke="#4338ca" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="32" y1="71" x2="56" y2="84" stroke="#4338ca" strokeWidth="0.8" strokeOpacity="0.7" />

          {/* Isometric Warehouse Storage Rack (Right) */}
          <path
            d="M 168,45 L 168,85 L 144,98 L 144,58 Z"
            fill="#1e1b4b"
            fillOpacity="0.5"
            stroke="#4338ca"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />
          <line x1="168" y1="58" x2="144" y2="71" stroke="#4338ca" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="168" y1="71" x2="144" y2="84" stroke="#4338ca" strokeWidth="0.8" strokeOpacity="0.7" />

          {/* Floating Smart Parcel (Centerpiece Isometric Cube) with Framer Motion */}
          <motion.g
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: 'easeInOut',
            }}
          >
            {/* Top Diamond Face */}
            <path
              d="M 100,32 L 126,45 L 100,58 L 74,45 Z"
              fill="url(#cubeTop)"
              stroke="#a5b4fc"
              strokeWidth="0.8"
            />
            {/* Left Face */}
            <path
              d="M 74,45 L 100,58 L 100,88 L 74,75 Z"
              fill="url(#cubeLeft)"
              stroke="#6366f1"
              strokeWidth="0.8"
            />
            {/* Right Face */}
            <path
              d="M 100,58 L 126,45 L 126,75 L 100,88 Z"
              fill="url(#cubeRight)"
              stroke="#818cf8"
              strokeWidth="0.8"
            />

            {/* Smart Parcel Details - Barcode stripes on right face */}
            <line x1="106" y1="62" x2="106" y2="78" stroke="#c7d2fe" strokeWidth="1" strokeOpacity="0.8" />
            <line x1="110" y1="60" x2="110" y2="76" stroke="#c7d2fe" strokeWidth="1.5" strokeOpacity="0.9" />
            <line x1="114" y1="58" x2="114" y2="74" stroke="#c7d2fe" strokeWidth="0.8" strokeOpacity="0.7" />
            <line x1="118" y1="56" x2="118" y2="72" stroke="#c7d2fe" strokeWidth="1.8" strokeOpacity="0.85" />

            {/* StockSense Emblem Symbol on Top Face */}
            <circle cx="100" cy="45" r="3" fill="#ffffff" />
            <circle cx="100" cy="45" r="5" fill="none" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="1 1" />

            {/* Holographic Laser Scanning Beam Animation */}
            <motion.line
              x1="65"
              y1="40"
              x2="135"
              y2="40"
              stroke="url(#scanBeam)"
              strokeWidth="2"
              animate={{
                y: [0, 42, 0],
                opacity: [0.25, 0.95, 0.25],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut',
              }}
            />
          </motion.g>

          {/* Floating Data Sparks */}
          <motion.circle
            cx="80"
            cy="36"
            r="1.5"
            fill="#38bdf8"
            animate={{
              y: [0, -12, 0],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: 0.3,
            }}
          />
          <motion.circle
            cx="120"
            cy="32"
            r="1.5"
            fill="#a855f7"
            animate={{
              y: [0, -14, 0],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.6,
              delay: 1.1,
            }}
          />
        </svg>

        {/* Hover Quick Action Hint */}
        <div className="absolute inset-0 bg-indigo-950/75 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5" />
            View Operations
          </span>
        </div>
      </div>

      {/* Real-time Status Footer */}
      <div 
        onClick={onExplore}
        className="mt-2 pt-2 border-t border-indigo-900/60 flex items-center justify-between text-[10px] cursor-pointer"
      >
        <span className="text-slate-400 font-medium group-hover:text-indigo-200 transition-colors">
          Audit Protocol
        </span>
        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
          100% In Sync &rarr;
        </span>
      </div>
    </div>
  );
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
          <div className={clsx('flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xs', collapsed && 'justify-center px-2')}>
            <div
              className={clsx('flex items-center gap-3 cursor-pointer group', collapsed && 'justify-center')}
              onClick={() => handleTabClick('dashboard')}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl blur-xs opacity-40 group-hover:opacity-80 transition duration-300" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
              </div>
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text">
                      StockSense
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/90 px-1 py-0.2 rounded shadow-2xs">
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
                'hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer',
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
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  Active Facility
                </span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="relative">
                <select
                  id="warehouse-select"
                  value={selectedWarehouseId}
                  onChange={handleWarehouseChange}
                  className="w-full bg-white hover:border-slate-400 border border-slate-200/90 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs transition-all appearance-none"
                >
                  <option value="">🏢 Enterprise (All Warehouses)</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.code} · {wh.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4" aria-label="Main menu">
            {navigationConfig.map((group) => (
              <div key={group.group} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{group.group}</span>
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
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group relative',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600',
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/25'
                          : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 hover:translate-x-0.5',
                        collapsed ? 'justify-center px-0' : 'text-left justify-start'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={clsx(
                        'flex-shrink-0 transition-transform duration-150',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 group-hover:scale-110'
                      )}>
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

            {/* Animated Warehouse Operations Hub Graphic */}
            <WarehouseOperationsWidget
              onExplore={() => handleTabClick('dashboard')}
              collapsed={collapsed}
            />
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
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={clsx(
                      'text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border',
                      user?.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : user?.role === 'WAREHOUSE_STAFF'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    )}>
                      {user?.role === 'ADMIN' ? '⚡ ADMIN' : user?.role === 'WAREHOUSE_STAFF' ? '📦 STAFF' : '👑 MANAGER'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {user?.role === 'ADMIN' ? 'Full Access' : user?.role === 'WAREHOUSE_STAFF' ? 'Transfers & Count' : 'Stock & Rules'}
                    </span>
                  </div>
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
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminAlerts = async () => {
      if (user?.role === 'ADMIN') {
        try {
          const res = await api.getAdminNotifications();
          if (isMounted && res.success) {
            setAdminNotifications(res.notifications || []);
          }
        } catch {
          // Ignore network or permission error
        }
      } else {
        if (isMounted) {
          setAdminNotifications([]);
        }
      }
    };

    fetchAdminAlerts();
    const interval = setInterval(fetchAdminAlerts, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.role, notificationsOpen]);

  const activeOtpCount = user?.role === 'ADMIN'
    ? adminNotifications.filter((n) => !n.isExpired && !n.isUsed).length
    : 0;

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
            onClick={() => navigate('/products?status=LOW_STOCK')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold transition-all hover:bg-amber-100 cursor-pointer shadow-2xs"
            title={`${lowStockCount} items below safety threshold - click to filter`}
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
            {(lowStockCount > 0 || activeOtpCount > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
            {(lowStockCount > 0 || activeOtpCount > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 max-h-[500px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Operational & Security Alerts</span>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold">Real-Time</span>
                </div>
                <div className="py-2 space-y-2">
                  {/* ADMIN OTP SECTION - Strictly ADMIN only */}
                  {user?.role === 'ADMIN' && (
                    <div className="space-y-1.5 pb-2 border-b border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          Password Reset OTPs (Admin Only)
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {activeOtpCount} Active
                        </span>
                      </div>

                      {adminNotifications.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-1">No recent 