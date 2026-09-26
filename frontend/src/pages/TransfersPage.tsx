import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  XCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  Trash2,
  Calendar,
  Building,
  User,
  ArrowRight,
  PackageCheck,
  CheckCheck,
} from 'lucide-react';
import { OperationTransfer, OperationType, OperationStatus, Product, Location } from '../types';
import api from '../services/api';

interface TransfersPageProps {
  type: OperationType;
  transfers: OperationTransfer[];
  products: Product[];
  locations: Location[];
  onRefresh: () => void;
  openCreateByDefault?: boolean;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({
  type,
  transfers,
  products,
  locations,
  onRefresh,
  openCreateByDefault = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Transfer for Form View
  const [selectedTransfer, setSelectedTransfer] = useState<OperationTransfer | null>(null);
  const [isCreating, setIsCreating] = useState(openCreateByDefault);

  // New Transfer Form State
  const [partnerName, setPartnerName] = useState('');
  const defaultSourceLoc =
    type === 'RECEIPT'
      ? locations.find((l) => l.type === 'VENDOR')?.id || locations[0]?.id
      : locations.find((l) => l.type === 'INTERNAL')?.id || locations[0]?.id;
  const defaultDestLoc =
    type === 'DELIVERY'
      ? locations.find((l) => l.type === 'CUSTOMER')?.id || locations[0]?.id
      : locations.find((l) => l.type === 'INTERNAL')?.id || locations[0]?.id;

  const [sourceLocationId, setSourceLocationId] = useState(defaultSourceLoc || '');
  const [destLocationId, setDestLocationId] = useState(defaultDestLoc || '');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<{ productId: string; demandQty: number; doneQty: number; uom: string }[]>([
    {
      productId: products[0]?.id || '',
      demandQty: 10,
      doneQty: 0,
      uom: products[0]?.uom || 'Units',
    },
  ]);

  // Done qty edits in form view
  const [doneUpdates, setDoneUpdates] = useState<Record<string, number>>({});

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Title configuration based on type
  const config = {
    RECEIPT: {
      title: 'Incoming Stock Receipts',
      shortCode: 'WH/IN',
      partnerLabel: 'Supplier / Vendor',
      partnerPlaceholder: 'e.g. Tata Steel Global Ltd',
      color: 'blue',
      icon: ArrowDownLeft,
    },
    DELIVERY: {
      title: 'Delivery Orders (Outgoing Goods)',
      shortCode: 'WH/OUT',
      partnerLabel: 'Customer / Shipping Recipient',
      partnerPlaceholder: 'e.g. Apex Global Logistics Ltd',
      color: 'emerald',
      icon: ArrowUpRight,
    },
    INTERNAL: {
      title: 'Internal Stock Transfers',
      shortCode: 'WH/INT',
      partnerLabel: 'Internal Department / Reason',
      partnerPlaceholder: 'e.g. Production Floor Requisition',
      color: 'amber',
      icon: ArrowLeftRight,
    },
    ADJUSTMENT: {
      title: 'Stock Adjustments',
      shortCode: 'WH/ADJ',
      partnerLabel: 'Audit Reason',
      partnerPlaceholder: 'Physical audit count',
      color: 'violet',
      icon: Layers,
    },
  }[type];

  const Icon = config.icon;

  // Filter transfers
  const filteredTransfers = transfers.filter((t) => {
    if (t.type !== type) return false;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.partnerName && t.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.lines.some((l) => l.product?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OperationStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Draft</span>;
      case 'WAITING':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Waiting</span>;
      case 'READY':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Ready</span>;
      case 'DONE':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Done</span>;
      case 'CANCELED':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Canceled</span>;
    }
  };

  // Line helpers
  const handleAddLine = () => {
    if (products.length === 0) return;
    setLines([
      ...lines,
      {
        productId: products[0].id,
        demandQty: 1,
        doneQty: 0,
        uom: products[0].uom,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleProductChange = (idx: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    const updated = [...lines];
    updated[idx].productId = prodId;
    if (prod) updated[idx].uom = prod.uom;
    setLines(updated);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await api.createTransfer({
        type,
        partnerName: partnerName || null,
        sourceLocationId,
        destLocationId,
        scheduledDate,
        notes,
        lines,
      });

      setFeedback({ type: 'success', message: 'Transfer created successfully in Draft!' });
      setIsCreating(false);
      onRefresh();
      setSelectedTransfer(res.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create transfer.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async (id: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await api.markTransferReady(id);
      setFeedback({ type: 'success', message: res.message });
      onRefresh();
      // refresh active
      const refreshed = await api.getTransfer(id);
      setSelectedTransfer(refreshed.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const lineUpdates = Object.entries(doneUpdates).map(([lineId, doneQty]) => ({
        lineId,
        doneQty: Number(doneQty),
      }));

      const res = await api.validateTransfer(id, lineUpdates.length > 0 ? lineUpdates : undefined);
      setFeedback({ type: 'success', message: res.message });
      onRefresh();
      setSelectedTransfer(res.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this transfer?')) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await api.cancelTransfer(id);
      setFeedback({ type: 'success', message: res.message });
      onRefresh();
      setSelectedTransfer((prev) => (prev ? { ...prev, status: 'CANCELED' } : null));
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Breadcrumb Workflow Stages
  const renderWorkflowStatus = (currentStatus: OperationStatus) => {
    const steps: OperationStatus[] =
      type === 'DELIVERY'
        ? ['DRAFT', 'WAITING', 'READY', 'DONE']
        : ['DRAFT', 'READY', 'DONE'];

    const getStepState = (step: OperationStatus) => {
      const stepIndex = steps.indexOf(step);
      const currentIndex = steps.indexOf(currentStatus);
      if (currentStatus === 'CANCELED') return 'canceled';
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'active';
      return 'future';
    };

    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, idx) => {
          const state = getStepState(step);
          return (
            <React.Fragment key={step}>
              {idx > 0 && <span className="text-slate-300 text-xs">→</span>}
              <div
                className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  state === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : state === 'active'
                    ? 'bg-[#714B67] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {state === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{step}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* FORM / DETAIL VIEW (If an order is opened or being created) */}
      {(selectedTransfer || isCreating) ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 space-y-6">
          {/* Top Form Header with Reference & Workflow Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTransfer(null);
                  setIsCreating(false);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                ← Back to List
              </button>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {config.title}
                </span>
                <h2 className="text-xl font-black text-slate-900 font-mono">
                  {isCreating ? `New ${config.shortCode} Draft` : selectedTransfer?.reference}
                </h2>
              </div>
            </div>

            {/* Workflow status bar */}
            {!isCreating && selectedTransfer && renderWorkflowStatus(selectedTransfer.status)}
          </div>

          {/* Action Buttons Toolbar */}
          {!isCreating && selectedTransfer && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-2">
                {selectedTransfer.status === 'DRAFT' && (
                  <button
                    onClick={() => handleMarkReady(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Mark as Ready</span>
                  </button>
                )}

                {selectedTransfer.status === 'WAITING' && (
                  <button
                    onClick={() => handleMarkReady(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Check Availability & Mark Ready</span>
                  </button>
                )}

                {selectedTransfer.status === 'READY' && (
                  <button
                    onClick={() => handleValidate(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 animate-pulse disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Validate (Move Inventory)</span>
                  </button>
                )}

                {selectedTransfer.status !== 'DONE' && selectedTransfer.status !== 'CANCELED' && (
                  <button
                    onClick={() => handleCancel(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Content */}
          {isCreating ? (
            <form onSubmit={handleCreateTransfer} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {config.partnerLabel}
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={config.partnerPlaceholder}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Location (From)</label>
                  <select
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Location (To)</label>
                  <select
                    value={destLocationId}
                    onChange={(e) => setDestLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Product Order Lines
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 w-32">Demand Qty</th>
                        <th className="py-2.5 px-3 w-28">UoM</th>
                        <th className="py-2.5 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">
                            <select
                              value={line.productId}
                              onChange={(e) => handleProductChange(idx, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white font-medium"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              required
                              value={line.demandQty}
                              onChange={(e) => {
                                const updated = [...lines];
                                updated[idx].demandQty = Number(e.target.value);
                                setLines(updated);
                              }}
                              className="w-full px-2 py-1 text-xs font-mono font-bold border border-slate-200 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-medium">{line.uom}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              disabled={lines.length <= 1}
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Carrier reference, dock instructions or inspection notes..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save As Draft'}
                </button>
              </div>
            </form>
          ) : (
            selectedTransfer && (
              <div className="space-y-6">
                {/* Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">{config.partnerLabel}</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedTransfer.partnerName || '—'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Scheduled Date</span>
                    <span className="font-bold text-slate-800">
                      {new Date(selectedTransfer.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Source Location</span>
                    <span className="font-bold text-slate-800">{selectedTransfer.sourceLocation.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {selectedTransfer.sourceLocation.code}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Destination Location</span>
                    <span className="font-bold text-emerald-800">{selectedTransfer.destLocation.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {selectedTransfer.destLocation.code}
                    </span>
                  </div>
                </div>

                {/* Transfer Lines Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Items & Quantities
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Product Name & SKU</th>
                          <th className="py-2.5 px-3 text-right">Demand</th>
                          <th className="py-2.5 px-3 text-right">Done Qty</th>
                          <th className="py-2.5 px-3">UoM</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedTransfer.lines.map((line) => {
                          const currentDone = doneUpdates[line.id!] ?? line.doneQty;
                          const isDone = selectedTransfer.status === 'DONE';

                          return (
                            <tr key={line.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900">{line.product?.name}</div>
                                <div className="text-[11px] font-mono text-purple-700">{line.product?.sku}</div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                                {line.demandQty}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isDone ? (
                                  <span className="font-mono font-bold text-emerald-700">{line.doneQty}</span>
                                ) : selectedTransfer.status === 'READY' ? (
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={currentDone}
                                    onChange={(e) =>
                                      setDoneUpdates({
                                        ...doneUpdates,
                                        [line.id!]: Number(e.target.value),
                                      })
                                    }
                                    className="w-20 px-2 py-1 text-right font-mono font-bold border border-purple-300 rounded focus:ring-1 focus:ring-purple-500"
                                  />
                                ) : (
                                  <span className="font-mono text-slate-400">{line.doneQty}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">{line.uom}</td>
                              <td className="py-2.5 px-3 text-center">
                                {line.doneQty >= line.demandQty ? (
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                    Fulfilled
                                  </span>
                                ) : line.doneQty > 0 ? (
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                    Partial
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedTransfer.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Notes:</span>
                    <p className="text-slate-600">{selectedTransfer.notes}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{config.title}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and process inventory document transfers with automated stock ledger synchronization.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New {config.shortCode}</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search by Reference (${config.shortCode}...), Partner or Product...`}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['ALL', 'DRAFT', 'WAITING', 'READY', 'DONE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition text-xs ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-3">{config.partnerLabel}</th>
                    <th className="py-3 px-3">From Location</th>
                    <th className="py-3 px-3">To Location</th>
                    <th className="py-3 px-3">Scheduled Date</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No {config.title.toLowerCase()} found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTransfer(t)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-purple-900 flex items-center gap-1.5">
                          <span>{t.reference}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {t.partnerName || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div>{t.sourceLocation.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{t.sourceLocation.code}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div>{t.destLocation.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{t.destLocation.code}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(t.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-center">{getStatusBadge(t.status)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTransfer(t);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 group-hover:bg-purple-100 rounded transition"
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
