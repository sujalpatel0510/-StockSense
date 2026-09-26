import React, { useState } from 'react';
import {
  Layers,
  Scale,
  Plus,
  CheckCircle,
  AlertTriangle,
  History,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Product, Location, OperationTransfer } from '../types';
import api from '../services/api';

interface AdjustmentsPageProps {
  products: Product[];
  locations: Location[];
  adjustments: OperationTransfer[];
  onRefresh: () => void;
}

export const AdjustmentsPage: React.FC<AdjustmentsPageProps> = ({
  products,
  locations,
  adjustments,
  onRefresh,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const internalLocs = locations.filter((l) => l.type === 'INTERNAL');
  const [selectedLocationId, setSelectedLocationId] = useState(internalLocs[0]?.id || '');
  const [countedQty, setCountedQty] = useState<number>(0);
  const [reason, setReason] = useState('Routine Physical Stock Audit');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentQuant = selectedProduct?.quants?.find((q) => q.locationId === selectedLocationId);
  const recordedQty = currentQuant ? currentQuant.quantity : 0;
  const delta = countedQty - recordedQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await api.createAdjustment({
        productId: selectedProductId,
        locationId: selectedLocationId,
        countedQty: Number(countedQty),
        reason,
      });

      setFeedback({ type: 'success', message: res.message });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply adjustment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 text-violet-700 rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Physical Inventory Adjustments
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconcile physical stock counts with recorded book inventory. Discrepancies are logged directly in the Stock Ledger.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Audit History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adjustment Action Form */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-violet-700" />
            Record Physical Count
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const prod = products.find((p) => p.id === e.target.value);
                  const q = prod?.quants?.find((qt) => qt.locationId === selectedLocationId);
                  setCountedQty(q ? q.quantity : 0);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Location</label>
              <select
                value={selectedLocationId}
                onChange={(e) => {
                  setSelectedLocationId(e.target.value);
                  const q = selectedProduct?.quants?.find((qt) => qt.locationId === e.target.value);
                  setCountedQty(q ? q.quantity : 0);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {internalLocs.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Recorded Stock Display */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">System Recorded Stock</span>
                <p className="text-lg font-black text-slate-900 font-mono">
                  {recordedQty} {selectedProduct?.uom}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Location balance</span>
              </div>
            </div>

            {/* Counted Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Counted Quantity *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={countedQty}
                onChange={(e) => setCountedQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Real-time Delta reconciliation preview */}
            <div
              className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                delta === 0
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : delta > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span className="font-semibold">Reconciliation Delta:</span>
              <span className="font-mono font-black text-sm flex items-center gap-1">
                {delta > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    +{delta} {selectedProduct?.uom} (Surplus Gain)
                  </>
                ) : delta < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    {delta} {selectedProduct?.uom} (Deficit / Scrap)
                  </>
                ) : (
                  '±0 (Exact Match)'
                )}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Reason / Note
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. 3 kg steel damaged during handling, or quarterly audit"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Scale className="w-4 h-4" />
              <span>Apply & Log to Stock Ledger</span>
            </button>
          </form>
        </div>

        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-violet-700" />
              Recent Adjustments Log
            </h2>
            <span className="text-xs text-slate-400 font-semibold">{adjustments.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Reason / Notes</th>
                  <th className="py-2.5 px-3 text-right">Adjusted Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No adjustments logged yet.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(adj.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-violet-900">
                        {adj.reference}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {adj.lines[0]?.product?.name || 'Item'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {adj.notes || adj.partnerName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {adj.lines[0]?.doneQty} {adj.lines[0]?.uom}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
