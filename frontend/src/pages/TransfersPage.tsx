import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
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
  X,
  FileText,
} from 'lucide-react';
import { OperationTransfer, OperationType, OperationStatus, Product, Location } from '../types';
import api from '../services/api';
import { StatusBadge, Badge } from '../components/ui';
import { EmptyState } from '../components/ui';
import { Button, Input, Select, Card } from '../components/ui';
import { Drawer } from '../components/ui';
import { useData } from '../context/DataContext';

interface TransfersPageProps {
  type: OperationType;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { 
    transfers: allTransfers, 
    products, 
    locations, 
    refreshTransfers,
    refreshProducts,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTransfer, setSelectedTransfer] = useState<OperationTransfer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Open creation drawer if URL has ?new=true or navigation state has openNew
  useEffect(() => {
    if (searchParams.get('new') === 'true' || (location.state as any)?.openNew) {
      setIsCreating(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, location.state]);

  // Ensure valid default locations once loaded
  useEffect(() => {
    if (!sourceLocationId && locations.length > 0) {
      const src = type === 'RECEIPT'
        ? locations.find((l) => l.type === 'VENDOR')?.id || locations[0]?.id
        : locations.find((l) => l.type === 'INTERNAL')?.id || locations[0]?.id;
      if (src) setSourceLocationId(src);
    }
    if (!destLocationId && locations.length > 0) {
      const dest = type === 'DELIVERY'
        ? locations.find((l) => l.type === 'CUSTOMER')?.id || locations[0]?.id
        : locations.find((l) => l.type === 'INTERNAL')?.id || locations[0]?.id;
      if (dest) setDestLocationId(dest);
    }
  }, [locations, type, sourceLocationId, destLocationId]);

  // Ensure first line product is set once products are loaded
  useEffect(() => {
    if (products.length > 0 && lines.length === 1 && !lines[0].productId) {
      setLines([{
        productId: products[0].id,
        demandQty: 10,
        doneQty: 0,
        uom: products[0].uom || 'Units',
      }]);
    }
  }, [products]);

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
      partnerLabel: 'Department / Internal Reason',
      partnerPlaceholder: 'e.g. Assembly Line Requisition',
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
  const filteredTransfers = allTransfers.filter((t) => {
    if (t.type !== type) return false;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.partnerName && t.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.lines.some((l) => l.product?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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

      setFeedback({ type: 'success', message: 'Transfer document successfully recorded in Draft!' });
      setIsCreating(false);
      setIsDrawerOpen(false);
      await refreshTransfers();
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
      await refreshTransfers();
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
      await refreshTransfers();
      setSelectedTransfer(res.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this transfer order?')) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await api.cancelTransfer(id);
      setFeedback({ type: 'success', message: res.message });
      await refreshTransfers();
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
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
        {steps.map((step, idx) => {
          const state = getStepState(step);
          return (
            <React.Fragment key={step}>
              {idx > 0 && <span className="text-text-muted text-caption font-bold">→</span>}
              <div
                className={`px-3 py-1.5 rounded-lg text-caption font-bold transition flex items-center gap-1.5 ${
                  state === 'completed'
                    ? 'bg-status-success-bg text-status-success-text border border-status-success-border'
                    : state === 'active'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : state === 'canceled'
                    ? 'bg-status-danger-bg text-status-danger-text border border-status-danger-border'
                    : 'bg-bg-elevated text-text-muted'
                }`}
              >
                {state === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-status-success-text" />}
                <span>{step}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Check if we should open detail view from URL
  useEffect(() => {
    if (params.id && !selectedTransfer) {
      const transfer = allTransfers.find(t => t.id === params.id);
      if (transfer) {
        setSelectedTransfer(transfer);
        setIsDrawerOpen(true);
      }
    }
  }, [params.id, allTransfers, selectedTransfer]);

  return (
    <div className="space-y-6">
      {/* User Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-caption flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-status-success-bg border-status-success-border text-status-success-text'
              : 'bg-status-danger-bg border-status-danger-border text-status-danger-text'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-text-muted hover:text-text-primary font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DETAIL / CREATION DRAWER */}
      <Drawer
        isOpen={isDrawerOpen || isCreating || !!selectedTransfer}
        onClose={() => {
          setIsDrawerOpen(false);
          setIsCreating(false);
          setSelectedTransfer(null);
          if (params.id) navigate('/transfers/' + type.toLowerCase() + 's');
        }}
        title={isCreating ? `New ${config.shortCode} Draft` : selectedTransfer?.reference}
        description={config.title}
        size="xl"
      >
        <div className="space-y-6">
          {/* Action Toolbar */}
          {!isCreating && selectedTransfer && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-elevated/50 p-3.5 rounded-xl border border-border-subtle">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTransfer.status === 'DRAFT' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PackageCheck className="w-4 h-4" />}
                    onClick={() => handleMarkReady(selectedTransfer.id)}
                    disabled={actionLoading}
                  >
                    Mark as Ready
                  </Button>
                )}

                {selectedTransfer.status === 'WAITING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCheck className="w-4 h-4" />}
                    onClick={() => handleMarkReady(selectedTransfer.id)}
                    disabled={actionLoading}
                  >
                    Check Availability & Mark Ready
                  </Button>
                )}

                {selectedTransfer.status === 'READY' && (
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleValidate(selectedTransfer.id)}
                    disabled={actionLoading}
                  >
                    Validate (Transfer Stock)
                  </Button>
                )}

                {selectedTransfer.status !== 'DONE' && selectedTransfer.status !== 'CANCELED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleCancel(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="text-brand-danger border-brand-danger hover:bg-brand-danger/5"
                  >
                    Cancel Transfer
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5 text-text-muted" />}
                  onClick={() => window.print()}
                >
                  Print Slip
                </Button>
              </div>
            </div>
          )}

          {/* Workflow stepper */}
          {!isCreating && selectedTransfer && (
            <div className="py-2">
              {renderWorkflowStatus(selectedTransfer.status)}
            </div>
          )}

          {/* Form Content */}
          {isCreating ? (
            <form onSubmit={handleCreateTransfer} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">{config.partnerLabel}</label>
                  <Input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={config.partnerPlaceholder}
                  />
                </div>

                <div>
                  <label className="label-base">Scheduled Date</label>
                  <Input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label-base">Source Location (From)</label>
                  <Select
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                    options={locations.map((loc) => ({ value: loc.id, label: `${loc.name} (${loc.code})` }))}
                  />
                </div>

                <div>
                  <label className="label-base">Destination Location (To)</label>
                  <Select
                    value={destLocationId}
                    onChange={(e) => setDestLocationId(e.target.value)}
                    options={locations.map((loc) => ({ value: loc.id, label: `${loc.name} (${loc.code})` }))}
                  />
                </div>
              </div>

              {/* Order Lines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-caption font-bold uppercase tracking-wider text-text-muted">Product Order Lines</h4>
                  <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={handleAddLine}>
                    Add Item
                  </Button>
                </div>

                <div className="border border-border-subtle rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-caption">
                    <thead className="bg-bg-elevated border-b border-border-subtle text-text-muted font-bold uppercase text-micro">
                      <tr>
                        <th className="py-3 px-3">Product</th>
                        <th className="py-3 px-3 w-36">Demand Quantity</th>
                        <th className="py-3 px-3 w-28">UoM</th>
                        <th className="py-3 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {lines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3">
                            <Select
                              value={line.productId}
                              onChange={(e) => handleProductChange(idx, e.target.value)}
                              options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                              className="font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <Input
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
                              className="font-mono tabular-nums font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-text-muted font-medium">{line.uom}</td>
                          <td className="py-2.5 px-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLine(idx)}
                              disabled={lines.length <= 1}
                              className="text-text-muted hover:text-brand-danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="label-base">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Carrier reference, shipping tags or handling notes..."
                  className="input-base resize-y"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
                <Button variant="secondary" type="button" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save As Draft'}
                </Button>
              </div>
            </form>
          ) : (
            selectedTransfer && (
              <div className="space-y-6">
                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-bg-elevated/50 rounded-2xl border border-border-subtle text-caption">
                  <div>
                    <span className="text-text-muted block text-micro font-semibold">{config.partnerLabel}</span>
                    <span className="font-bold text-text-primary text-body">{selectedTransfer.partnerName || '—'}</span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-micro font-semibold">Scheduled Date</span>
                    <span className="font-bold text-text-primary">
                      {new Date(selectedTransfer.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-micro font-semibold">Source Location</span>
                    <span className="font-bold text-text-primary">{selectedTransfer.sourceLocation.name}</span>
                    <span className="text-micro text-text-muted font-mono block">{selectedTransfer.sourceLocation.code}</span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-micro font-semibold">Destination Location</span>
                    <span className="font-bold text-emerald-800">{selectedTransfer.destLocation.name}</span>
                    <span className="text-micro text-text-muted font-mono block">{selectedTransfer.destLocation.code}</span>
                  </div>
                </div>

                {/* Items & Fulfillment Table */}
                <div>
                  <h4 className="text-caption font-bold uppercase tracking-wider text-text-muted mb-2.5">
                    Order Items & Physical Fulfillment
                  </h4>
                  <div className="border border-border-subtle rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-caption">
                      <thead className="bg-bg-elevated border-b border-border-subtle text-text-muted font-bold uppercase text-micro">
                        <tr>
                          <th className="py-3 px-4">Product Name & SKU</th>
                          <th className="py-3 px-3 text-right">Demand</th>
                          <th className="py-3 px-3 text-right">Done Qty</th>
                          <th className="py-3 px-3">UoM</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {selectedTransfer.lines.map((line) => {
                          const currentDone = doneUpdates[line.id!] ?? line.doneQty;
                          const isDone = selectedTransfer.status === 'DONE';

                          return (
                            <tr key={line.id} className="hover:bg-bg-elevated/50">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-text-primary">{line.product?.name}</div>
                                <div className="text-micro font-mono text-brand-primary">{line.product?.sku}</div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-text-secondary">
                                {line.demandQty}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {isDone ? (
                                  <span className="font-mono tabular-nums font-bold text-emerald-700">{line.doneQty}</span>
                                ) : selectedTransfer.status === 'READY' ? (
                                  <Input
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
                                    className="w-20 px-2.5 py-1 text-right font-mono tabular-nums font-bold border border-brand-primary/30 rounded-lg"
                                  />
                                ) : (
                                  <span className="font-mono tabular-nums text-text-muted">{line.doneQty}</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-text-secondary font-medium">{line.uom}</td>
                              <td className="py-3 px-4 text-center">
                                {line.doneQty >= line.demandQty ? (
                                  <Badge variant="success" size="sm">Fulfilled</Badge>
                                ) : line.doneQty > 0 ? (
                                  <Badge variant="warning" size="sm">Partial</Badge>
                                ) : (
                                  <Badge variant="neutral" size="sm">Pending</Badge>
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
                  <div className="p-4 bg-bg-elevated rounded-xl border border-border-subtle text-caption">
                    <span className="font-bold text-text-secondary block mb-0.5">Notes:</span>
                    <p className="text-text-muted">{selectedTransfer.notes}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </Drawer>

      {/* LIST VIEW */}
      <div className="space-y-4">
        {/* Header */}
        <Card variant="default" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-h2 font-extrabold text-text-primary tracking-tight">{config.title}</h1>
              <p className="text-caption text-text-muted mt-0.5">
                Process transfer documents with double-entry stock ledger synchronization.
              </p>
            </div>
          </div>

          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
            New {config.shortCode}
          </Button>
        </Card>

        {/* Search & Status Filters */}
        <Card variant="default" padding="md" className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search by Reference (${config.shortCode}...), Partner or Product...`}
              className="pl-9 pr-3"
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-xl text-caption">
            {(['ALL', 'DRAFT', 'WAITING', 'READY', 'DONE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition text-caption ${
                  statusFilter === st
                    ? 'bg-bg-surface text-text-primary shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </Card>

        {/* Table */}
        {filteredTransfers.length === 0 ? (
          <EmptyState
            title={`No ${config.title} Found`}
            description="No transfers matched your filter criteria. Create a new transfer document or clear your search term."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-caption">
                <thead className="bg-bg-elevated/50 border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-micro">
                  <tr>
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-3">{config.partnerLabel}</th>
                    <th className="py-3.5 px-3">From Location</th>
                    <th className="py-3.5 px-3">To Location</th>
                    <th className="py-3.5 px-3">Scheduled Date</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredTransfers.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => {
                        setSelectedTransfer(t);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-bg-elevated/50 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-primary flex items-center gap-1.5">
                        <span>{t.reference}</span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-text-primary">
                        {t.partnerName || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-text-secondary">
                        <div className="font-medium text-text-primary">{t.sourceLocation.name}</div>
                        <span className="text-micro text-text-muted font-mono">{t.sourceLocation.code}</span>
                      </td>
                      <td className="py-3.5 px-3 text-text-secondary">
                        <div className="font-medium text-emerald-800">{t.destLocation.name}</div>
                        <span className="text-micro text-text-muted font-mono">{t.destLocation.code}</span>
                      </td>
                      <td className="py-3.5 px-3 text-text-muted font-mono tabular-nums text-micro">
                        {new Date(t.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransfer(t);
                            setIsDrawerOpen(true);
                          }}
                        >
                          Open Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};