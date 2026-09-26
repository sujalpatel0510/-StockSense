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
  X,
  FileCheck2,
} from 'lucide-react';
import { Product, Location, OperationTransfer } from '../types';
import api from '../services/api';
import { EmptyState } from '../components/ui';
import { Button, Input, Select, Card, Badge } from '../components/ui';
import { useData } from '../context/DataContext';

export const AdjustmentsPage: React.FC = () => {
  const { products, locations, adjustments, refreshTransfers } = useData();
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
      await refreshTransfers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply adjustment.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
    const prod = products.find((p) => p.id === e.target.value);
    const q = prod?.quants?.find((qt) => qt.locationId === selectedLocationId);
    setCountedQty(q ? q.quantity : 0);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocationId(e.target.value);
    const q = selectedProduct?.quants?.find((qt) => qt.locationId === e.target.value);
    setCountedQty(q ? q.quantity : 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="default" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-h2 font-extrabold text-text-primary tracking-tight">Physical Inventory Adjustments</h1>
            <p className="text-caption text-text-muted mt-0.5">
              Reconcile physical stock counts with recorded book inventory. Discrepancies are logged directly in the Stock Ledger.
            </p>
          </div>
        </div>
      </Card>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-caption flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-status-success-bg border-status-success-border text-status-success-text'
              : 'bg-status-danger-bg border-status-danger-border text-status-danger-text'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-status-success-text" />
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-caption p-1 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Audit History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adjustment Action Form */}
        <Card variant="default" padding="lg">
          <h2 className="font-bold text-body text-text-primary flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-brand-primary" />
            Record Physical Count
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Select Product</label>
              <Select
                value={selectedProductId}
                onChange={handleProductChange}
                options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              />
            </div>

            <div>
              <label className="label-base">Stock Location</label>
              <Select
                value={selectedLocationId}
                onChange={handleLocationChange}
                options={internalLocs.map((loc) => ({ value: loc.id, label: `${loc.name} (${loc.code})` }))}
              />
            </div>

            {/* Current Recorded Stock Display */}
            <Card variant="outlined" padding="md" className="flex items-center justify-between">
              <div>
                <span className="text-micro font-bold text-text-muted uppercase tracking-wider">System Recorded Stock</span>
                <p className="text-h3 font-extrabold text-text-primary font-mono tabular-nums mt-1">
                  {recordedQty} {selectedProduct?.uom}
                </p>
              </div>
              <div className="text-right">
                <span className="text-micro text-text-muted">Current balance</span>
              </div>
            </Card>

            {/* Counted Quantity */}
            <div>
              <label className="label-base">Physical Counted Quantity *</label>
              <Input
                type="number"
                min="0"
                step="any"
                required
                value={countedQty}
                onChange={(e) => setCountedQty(Number(e.target.value))}
                className="text-body font-mono tabular-nums font-bold"
              />
            </div>

            {/* Real-time Delta preview */}
            <Card
              variant={delta === 0 ? 'outlined' : delta > 0 ? 'default' : 'default'}
              className={`border ${
                delta === 0
                  ? 'border-border-subtle'
                  : delta > 0
                  ? 'border-status-success-border bg-status-success-bg/50'
                  : 'border-status-danger-border bg-status-danger-bg/50'
              }`}
              padding="md"
            >
              <div className="flex items-center justify-between text-caption">
                <span className="font-semibold">Reconciliation Delta:</span>
                <span className="font-mono tabular-nums font-bold text-body flex items-center gap-1">
                  {delta > 0 ? (
                    <>
                      <TrendingUp className={`w-4 h-4 ${delta > 0 ? 'text-status-success-text' : 'text-status-danger-text'}`} />
                      +{delta} {selectedProduct?.uom} (Surplus Gain)
                    </>
                  ) : delta < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-status-danger-text" />
                      {delta} {selectedProduct?.uom} (Deficit / Scrap)
                    </>
                  ) : (
                    '±0 (Exact Match)'
                  )}
                </span>
              </div>
            </Card>

            <div>
              <label className="label-base">Adjustment Reason / Note</label>
              <Input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Broken packaging, routine monthly cycle audit"
              />
            </div>

            <Button variant="primary" type="submit" disabled={loading} className="w-full" leftIcon={<Scale className="w-4 h-4" />}>
              Apply & Log to Stock Ledger
            </Button>
          </form>
        </Card>

        {/* Audit Log Table */}
        <Card variant="default" padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-body text-text-primary flex items-center gap-2">
              <History className="w-5 h-5 text-brand-primary" />
              Recent Adjustments Log
            </h2>
            <Badge variant="info" size="sm">{adjustments.length} Records</Badge>
          </div>

          {adjustments.length === 0 ? (
            <EmptyState
              title="No Adjustments Recorded"
              description="No physical inventory count adjustments have been performed yet. Use the form on the left to reconcile physical counts."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-caption">
                <thead className="bg-bg-elevated border-b border-border-subtle text-text-muted font-bold uppercase text-micro">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Reason / Notes</th>
                    <th className="py-3 px-3 text-right">Adjusted Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-bg-elevated/50 transition-colors">
                      <td className="py-3 px-3 text-text-muted font-mono tabular-nums text-micro">
                        {new Date(adj.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-brand-primary">{adj.reference}</td>
                      <td className="py-3 px-3 font-medium text-text-primary">{adj.lines[0]?.product?.name || 'Item'}</td>
                      <td className="py-3 px-3 text-text-muted max-w-xs truncate">{adj.notes || adj.partnerName}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-text-primary">
                        {adj.lines[0]?.doneQty} {adj.lines[0]?.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};