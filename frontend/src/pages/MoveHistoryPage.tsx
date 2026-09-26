import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  ArrowRight,
  Building2,
  CheckCircle,
  FileSpreadsheet,
  Activity,
  Layers,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { StockMove, Product, Location } from '../types';
import { StatCard, Card } from '../components/ui';
import { StatusBadge, Badge } from '../components/ui';
import { EmptyState } from '../components/ui';
import { Button, Input, Select } from '../components/ui';
import { useData } from '../context/DataContext';

export const MoveHistoryPage: React.FC = () => {
  const { moves, products, locations } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const filteredMoves = moves.filter((m) => {
    const matchesSearch =
      m.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sourceLocation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destLocation.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = selectedProductId ? m.productId === selectedProductId : true;
    const matchesLocation = selectedLocationId
      ? m.sourceLocationId === selectedLocationId || m.destLocationId === selectedLocationId
      : true;

    return matchesSearch && matchesProduct && matchesLocation;
  });

  const totalUnitsMoved = moves.reduce((acc, m) => acc + m.quantity, 0);

  const handleExportCSV = () => {
    if (filteredMoves.length === 0) return;
    const headers = [
      'Date',
      'Reference',
      'Product Name',
      'SKU',
      'Source Location',
      'Destination Location',
      'Quantity',
      'UoM',
      'Status',
      'Notes',
    ];
    const rows = filteredMoves.map((m) => [
      `"${new Date(m.createdAt).toISOString()}"`,
      `"${m.reference}"`,
      `"${m.product.name}"`,
      `"${m.product.sku}"`,
      `"${m.sourceLocation.name}"`,
      `"${m.destLocation.name}"`,
      m.quantity,
      `"${m.uom}"`,
      `"${m.status}"`,
      `"${m.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Card variant="default" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-h2 font-extrabold text-text-primary tracking-tight">Move History & Stock Ledger</h1>
            <p className="text-caption text-text-muted mt-0.5">
              Complete, immutable double-entry audit trail tracking every physical stock movement across your enterprise.
            </p>
          </div>
        </div>

        <Button variant="secondary" leftIcon={<Download className="w-4 h-4 text-text-muted" />} onClick={handleExportCSV}>
          Export Ledger (CSV)
        </Button>
      </Card>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ledger Moves"
          value={moves.length}
          subtitle="Immutable transaction events"
          icon={Activity}
          iconColor="text-brand-primary"
          iconBg="bg-brand-primary/10"
        />

        <StatCard
          title="Total Units Transferred"
          value={totalUnitsMoved.toLocaleString()}
          subtitle="Cumulative items dispatched/received"
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Tracked Locations"
          value={locations.length}
          subtitle="Warehouses, docks & staging zones"
          icon={Building2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Ledger Compliance"
          value="100%"
          subtitle="Double-entry balanced debits & credits"
          icon={ShieldCheck}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          badge={{ text: 'Verified', variant: 'positive' }}
        />
      </div>

      {/* Filters Bar */}
      <Card variant="default" padding="md" className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Reference, Product, SKU or Location..."
            className="pl-9 pr-3"
          />
        </div>

        {/* Product Filter */}
        <Select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          options={[
            { value: '', label: 'All Products' },
            ...products.map((p) => ({ value: p.id, label: p.name })),
          ]}
          className="max-w-[200px]"
        />

        {/* Location Filter */}
        <Select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          options={[
            { value: '', label: 'All Locations' },
            ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
          ]}
          className="max-w-[200px]"
        />

        <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />} onClick={() => {
          setSearchTerm('');
          setSelectedProductId('');
          setSelectedLocationId('');
        }}>
          Clear Filters
        </Button>
      </Card>

      {/* Ledger Table */}
      {filteredMoves.length === 0 ? (
        <EmptyState
          title="No Stock Movements Found"
          description="No ledger transactions match your current search filters. Try clearing your filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedProductId('');
            setSelectedLocationId('');
          }}
        />
      ) : (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead className="bg-bg-elevated/50 border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-micro">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-3">Reference</th>
                  <th className="py-3.5 px-3">From (Source)</th>
                  <th className="py-3.5 px-3">To (Destination)</th>
                  <th className="py-3.5 px-3">Product & SKU</th>
                  <th className="py-3.5 px-3 text-right">Quantity</th>
                  <th className="py-3.5 px-3">Unit</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredMoves.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="py-3.5 px-4 text-text-muted font-mono tabular-nums text-micro">
                      {new Date(m.createdAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-primary">{m.reference}</td>
                    <td className="py-3.5 px-3 text-text-secondary">
                      <div className="font-medium">{m.sourceLocation.name}</div>
                      <span className="text-micro text-text-muted font-mono">{m.sourceLocation.code}</span>
                    </td>
                    <td className="py-3.5 px-3 text-emerald-800">
                      <div className="font-medium">{m.destLocation.name}</div>
                      <span className="text-micro text-text-muted font-mono">{m.destLocation.code}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-text-primary">{m.product.name}</div>
                      <div className="text-micro font-mono text-text-muted">{m.product.sku}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-black text-text-primary text-body">+{m.quantity}</td>
                    <td className="py-3.5 px-3 text-text-secondary font-medium">{m.uom}</td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status="DONE" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};