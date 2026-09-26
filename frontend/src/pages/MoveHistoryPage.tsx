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
} from 'lucide-react';
import { StockMove, Product, Location } from '../types';

interface MoveHistoryPageProps {
  moves: StockMove[];
  products: Product[];
  locations: Location[];
}

export const MoveHistoryPage: React.FC<MoveHistoryPageProps> = ({ moves, products, locations }) => {
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

  const handleExportCSV = () => {
    if (filteredMoves.length === 0) return;
    const headers = ['Date', 'Reference', 'Product Name', 'SKU', 'Source Location', 'Destination Location', 'Quantity', 'UoM', 'Status', 'Notes'];
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Move History & Stock Ledger
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete, immutable double-entry audit trail tracking every physical stock movement across your enterprise.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Reference, Product, SKU or Location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Product Filter */}
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700 max-w-[200px]"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700 max-w-[200px]"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ledger Table (Matching Wireframe!) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">From (Source)</th>
                <th className="py-3 px-3">To (Destination)</th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMoves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No movements logged in the ledger matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMoves.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-900">
                      {m.reference}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-medium">{m.sourceLocation.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.sourceLocation.code}</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-800">
                      <div className="font-medium">{m.destLocation.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.destLocation.code}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{m.product.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{m.product.sku}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                      {m.quantity}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{m.uom}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Done
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
