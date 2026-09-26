import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Boxes,
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, ProductCategory, Warehouse } from '../types';
import { ActiveTab } from '../components/Navbar';

interface DashboardPageProps {
  stats: DashboardStats | null;
  categories: ProductCategory[];
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransfer: (type: 'RECEIPT' | 'DELIVERY' | 'INTERNAL') => void;
  onOpenNewAdjustment: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  categories,
  warehouses,
  selectedWarehouseId,
  setActiveTab,
  onOpenNewTransfer,
  onOpenNewAdjustment,
}) => {
  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading StockSense Operations...</p>
        </div>
      </div>
    );
  }

  const { kpis, operationsSummary, categoryStats, recentMoves } = stats;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Inventory Overview</h1>
            <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized snapshot of incoming receipts, customer dispatches, internal movements & physical counts.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenNewTransfer('RECEIPT')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Receipt</span>
          </button>
          <button
            onClick={() => onOpenNewTransfer('DELIVERY')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Delivery</span>
          </button>
          <button
            onClick={() => onOpenNewTransfer('INTERNAL')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Internal Transfer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Products */}
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
              <Package className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.totalProductsCount}</span>
            <span className="text-xs text-slate-500 font-medium">SKUs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{kpis.totalItemsInStock} units in stock</p>
        </div>

        {/* Low Stock / Out of Stock */}
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low / Out of Stock</span>
            <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{kpis.lowStockCount + kpis.outOfStockCount}</span>
            <span className="text-xs text-amber-700/80 font-medium">alerts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {kpis.outOfStockCount} zero stock, {kpis.lowStockCount} below min
          </p>
        </div>

        {/* Pending Receipts */}
        <div
          onClick={() => setActiveTab('receipts')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Receipts</span>
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
              <ArrowDownLeft className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{kpis.pendingReceipts}</span>
            <span className="text-xs text-slate-500 font-medium">incoming</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">To process on receiving dock</p>
        </div>

        {/* Pending Deliveries */}
        <div
          onClick={() => setActiveTab('deliveries')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Deliveries</span>
            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{kpis.pendingDeliveries}</span>
            <span className="text-xs text-slate-500 font-medium">outgoing</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready or waiting dispatch</p>
        </div>

        {/* Internal Transfers */}
        <div
          onClick={() => setActiveTab('internal')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-violet-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Internal Transfers</span>
            <div className="p-2 bg-violet-50 rounded-lg group-hover:bg-violet-100 transition">
              <ArrowLeftRight className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-violet-600">{kpis.internalScheduled}</span>
            <span className="text-xs text-slate-500 font-medium">scheduled</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Warehouse/Rack movements</p>
        </div>
      </div>

      {/* Wireframe Operation Cards Row (Matching Excalidraw Mockup exactly!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receipts Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Receipts
              </h3>
              <span className="text-[11px] bg-blue-50 text-blue-700 font-mono font-bold px-2 py-0.5 rounded">
                WH/IN
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div
                onClick={() => setActiveTab('receipts')}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-3xl font-black text-blue-700">{operationsSummary.receipts.toProcess}</span>
                <span className="block text-xs font-semibold text-slate-500">To Process</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-400">{operationsSummary.receipts.total}</span>
                <span className="block text-[11px] text-slate-400">Total Ops</span>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('receipts')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              View Orders →
            </button>
            <button
              onClick={() => onOpenNewTransfer('RECEIPT')}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold hover:bg-blue-100 transition"
            >
              + New Receipt
            </button>
          </div>
        </div>

        {/* Delivery Orders Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Delivery Orders
              </h3>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded">
                WH/OUT
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div
                onClick={() => setActiveTab('deliveries')}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-3xl font-black text-emerald-700">{operationsSummary.deliveries.toProcess}</span>
                <span className="block text-xs font-semibold text-slate-500">To Process</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-400">{operationsSummary.deliveries.total}</span>
                <span className="block text-[11px] text-slate-400">Total Ops</span>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('deliveries')}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold hover:underline"
            >
              View Orders →
            </button>
            <button
              onClick={() => onOpenNewTransfer('DELIVERY')}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold hover:bg-emerald-100 transition"
            >
              + New Delivery
            </button>
          </div>
        </div>

        {/* Internal Transfers Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Internal Transfers
              </h3>
              <span className="text-[11px] bg-amber-50 text-amber-700 font-mono font-bold px-2 py-0.5 rounded">
                WH/INT
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div
                onClick={() => setActiveTab('internal')}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-3xl font-black text-amber-700">{operationsSummary.internal.toProcess}</span>
                <span className="block text-xs font-semibold text-slate-500">To Process</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-400">{operationsSummary.internal.total}</span>
                <span className="block text-[11px] text-slate-400">Total Ops</span>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('internal')}
              className="text-xs text-amber-600 hover:text-amber-800 font-bold hover:underline"
            >
              View Transfers →
            </button>
            <button
              onClick={() => onOpenNewTransfer('INTERNAL')}
              className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-bold hover:bg-amber-100 transition"
            >
              + New Transfer
            </button>
          </div>
        </div>

        {/* Inventory Adjustments Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                Adjustments
              </h3>
              <span className="text-[11px] bg-violet-50 text-violet-700 font-mono font-bold px-2 py-0.5 rounded">
                WH/ADJ
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div
                onClick={() => setActiveTab('adjustments')}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-3xl font-black text-violet-700">{operationsSummary.adjustments.total}</span>
                <span className="block text-xs font-semibold text-slate-500">Adjustments</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Audited
                </span>
                <span className="block text-[11px] text-slate-400">Reconciled</span>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('adjustments')}
              className="text-xs text-violet-600 hover:text-violet-800 font-bold hover:underline"
            >
              View Audit Log →
            </button>
            <button
              onClick={onOpenNewAdjustment}
              className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-bold hover:bg-violet-100 transition"
            >
              + Physical Count
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Stock & Live Movements Ledger Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stock Distribution by Category */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-700" />
              Stock by Product Category
            </h2>
            <span className="text-xs font-semibold text-slate-400">{categoryStats.length} Categories</span>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((cat, idx) => {
              const maxQty = Math.max(...categoryStats.map((c) => c.totalQty), 1);
              const percentage = Math.round((cat.totalQty / maxQty) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{cat.category}</span>
                    <span className="text-slate-500 font-mono">
                      {cat.totalQty} units ({cat.productCount} SKUs)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-[#714B67] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold"
            >
              Manage Products & Reorder Rules →
            </button>
          </div>
        </div>

        {/* Right: Live Ledger Movement Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Real-Time Stock Ledger Stream
            </h2>
            <button
              onClick={() => setActiveTab('moves')}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold hover:underline"
            >
              Full Stock Ledger →
            </button>
          </div>

          {recentMoves.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No movements recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Ref</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">From → To</th>
                    <th className="pb-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentMoves.map((move: any) => (
                    <tr key={move.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {new Date(move.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-bold font-mono text-purple-900">
                        {move.reference}
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-800">{move.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{move.product.sku}</div>
                      </td>
                      <td className="py-2.5 text-slate-600">
                        <span className="font-medium text-slate-700">{move.sourceLocation.name}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-medium text-emerald-700">{move.destLocation.name}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        +{move.quantity} {move.uom || move.product.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
