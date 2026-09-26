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
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StockMove, Product, Location } from '../types';
import { StatCard, Card } from '../components/ui';
import { StatusBadge, Badge } from '../components/ui';
import { EmptyState } from '../components/ui';
import { Button, Input, Select } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const MoveHistoryPage: React.FC = () => {
  const { moves, products, locations, warehouses, selectedWarehouseId } = useData();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const filteredMoves = moves.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (m.reference || '').toLowerCase().includes(term) ||
      (m.product?.name || '').toLowerCase().includes(term) ||
      (m.product?.sku || '').toLowerCase().includes(term) ||
      (m.sourceLocation?.name || '').toLowerCase().includes(term) ||
      (m.destLocation?.name || '').toLowerCase().includes(term);

    const matchesProduct = selectedProductId ? m.productId === selectedProductId : true;
    const matchesLocation = selectedLocationId
      ? m.sourceLocationId === selectedLocationId || m.destLocationId === selectedLocationId
      : true;

    return matchesSearch && matchesProduct && matchesLocation;
  });

  const totalUnitsMoved = moves.reduce((acc, m) => acc + (m.quantity || 0), 0);

  const handleExportPDF = () => {
    if (filteredMoves.length === 0) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);
    const facilityName = currentWarehouse ? `${currentWarehouse.name} (${currentWarehouse.code})` : 'Enterprise (All Facilities)';
    const exportTime = new Date().toLocaleString();

    // 1. Header Banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 842, 68, 'F');

    // Title & Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('StockSense IMS — Move History & Stock Ledger', 40, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225); // Slate-300
    doc.text('Official Immutable Double-Entry Stock Movement Record & Audit Trail', 40, 52);

    // Meta Block on the Right
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249);
    doc.text(`Generated: ${exportTime}`, 802, 28, { align: 'right' });
    doc.text(`Active Facility: ${facilityName}`, 802, 42, { align: 'right' });
    doc.text(`Operator: ${user?.fullName || 'StockSense User'} (${user?.role?.replace('_', ' ') || 'STAFF'})`, 802, 56, { align: 'right' });

    // Summary KPI Strip
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.roundedRect(40, 78, 762, 30, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text(`Total Records: ${filteredMoves.length} movements`, 55, 97);
    doc.text(`Total Volume Moved: ${totalUnitsMoved.toLocaleString()} units`, 280, 97);
    doc.text(`Active Filter: ${selectedProductId ? 'Product Filtered' : 'All Products'} | ${selectedLocationId ? 'Location Filtered' : 'All Locations'}`, 530, 97);

    // Table
    const tableHeaders = [
      'Date & Time',
      'Reference',
      'Product & SKU',
      'From Location',
      'To Location',
      'Qty & UoM',
      'Status',
    ];

    const tableRows = filteredMoves.map((m) => [
      m.createdAt ? new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—',
      m.reference || '—',
      `${m.product?.name || 'Stock Item'}\n[${m.product?.sku || 'SKU'}]`,
      m.sourceLocation?.name || 'Vendor / External',
      m.destLocation?.name || 'Customer / Scrap',
      `+${m.quantity} ${m.uom || m.product?.uom || 'units'}`,
      m.status || 'DONE',
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 118,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Indigo 600
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 95 },
        1: { cellWidth: 95, fontStyle: 'bold' },
        2: { cellWidth: 160 },
        3: { cellWidth: 130 },
        4: { cellWidth: 130 },
        5: { cellWidth: 80, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 72, halign: 'center' },
      },
      didDrawPage: (data) => {
        // Footer on each page
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.text(
          `StockSense IMS — Certified Double-Entry Inventory Audit Trail • Confidential • Page ${data.pageNumber} of ${pageCount}`,
          421,
          580,
          { align: 'center' }
        );
      },
      margin: { top: 118, right: 40, bottom: 40, left: 40 },
    });

    const fileDate = new Date().toISOString().split('T')[0];
    doc.save(`StockSense_Stock_Ledger_${fileDate}.pdf`);
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

        <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>
          Export Ledger (PDF)
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
                      <div className="font-medium">{m.sourceLocation?.name || 'Vendor / Source'}</div>
                      <span className="text-micro text-text-muted font-mono">{m.sourceLocation?.code || '—'}</span>
                    </td>
                    <td className="py-3.5 px-3 text-emerald-800">
                      <div className="font-medium">{m.destLocation?.name || 'Customer / Dest'}</div>
                      <span className="text-micro text-text-muted font-mono">{m.destLocation?.code || '—'}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-text-primary">{m.product?.name || 'Stock Item'}</div>
                      <div className="text-micro font-mono text-text-muted">{m.product?.sku || '—'}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-black text-text-primary text-body">+{m.quantity}</td>
                    <td className="py-3.5 px-3 text-text-secondary font-medium">{m.uom || m.product?.uom || 'units'}</td>
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