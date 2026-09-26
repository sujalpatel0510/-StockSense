import React, { useState } from 'react';
import {
  Settings,
  Building2,
  MapPin,
  Plus,
  CheckCircle,
  AlertCircle,
  Check,
  Shield,
  Layers,
  X,
} from 'lucide-react';
import { Warehouse, Location, LocationType } from '../types';
import api from '../services/api';

interface SettingsPageProps {
  warehouses: Warehouse[];
  locations: Location[];
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ warehouses, locations, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'warehouses' | 'locations'>('warehouses');

  // Modals
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Warehouse form
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // Location form
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || '');
  const [locType, setLocType] = useState<LocationType>('INTERNAL');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.createWarehouse({
        name: whName,
        code: whCode.toUpperCase(),
        address: whAddress,
      });
      setFeedback({ type: 'success', message: res.message });
      setIsWarehouseModalOpen(false);
      setWhName('');
      setWhCode('');
      setWhAddress('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create warehouse.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.createLocation({
        name: locName,
        code: locCode.toUpperCase(),
        warehouseId: locType === 'INTERNAL' ? locWarehouseId : undefined,
        type: locType,
      });
      setFeedback({ type: 'success', message: res.message });
      setIsLocationModalOpen(false);
      setLocName('');
      setLocCode('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create location.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure multi-warehouse hierarchies and virtual/physical double-entry stock locations.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('warehouses')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeSubTab === 'warehouses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Warehouses ({warehouses.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('locations')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeSubTab === 'locations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Locations ({locations.length})</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
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

      {/* WAREHOUSES SUB-TAB */}
      {activeSubTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700">Configured Warehouses</h2>
            <button
              onClick={() => setIsWarehouseModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      {wh.code}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">{wh.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{wh.address || 'No physical address specified'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Locations mapped: {wh.locations?.length || 3}</span>
                  <span className="font-mono text-[10px]">ID: {wh.id.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOCATIONS SUB-TAB */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-700">Inventory Locations Hierarchy</h2>
              <p className="text-xs text-slate-400">
                Double-entry model incorporates physical internal zones alongside virtual supplier and customer endpoints.
              </p>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Location Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Parent Warehouse</th>
                  <th className="py-3 px-3">Location Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{loc.name}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-purple-700">{loc.code}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {loc.warehouse?.name || '— (Virtual / Global)'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          loc.type === 'INTERNAL'
                            ? 'bg-blue-100 text-blue-800'
                            : loc.type === 'VENDOR'
                            ? 'bg-purple-100 text-purple-800'
                            : loc.type === 'CUSTOMER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {loc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-600 font-medium text-xs">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-700" />
                Add Warehouse Facility
              </h3>
              <button onClick={() => setIsWarehouseModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="e.g. Surat Regional Hub"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code *</label>
                <input
                  type="text"
                  required
                  value={whCode}
                  onChange={(e) => setWhCode(e.target.value)}
                  placeholder="e.g. WH-SRT"
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Default internal locations (Stock, Input, Output) will be created automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  placeholder="Street, City, Postal Code..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-1.5 bg-[#714B67] text-white rounded-lg text-xs font-bold hover:bg-[#593952]"
                >
                  {loading ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-700" />
                Add Inventory Location
              </h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Shelf Rack C-03 or Heavy Staging Dock"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code *</label>
                <input
                  type="text"
                  required
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value)}
                  placeholder="e.g. WH1/RACK-C"
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Type</label>
                <select
                  value={locType}
                  onChange={(e) => setLocType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="INTERNAL">Internal Physical Location</option>
                  <option value="VENDOR">Vendor / Supplier Virtual Endpoint</option>
                  <option value="CUSTOMER">Customer Delivery Virtual Endpoint</option>
                  <option value="INVENTORY_LOSS">Inventory Scrap / Loss Virtual Location</option>
                </select>
              </div>

              {locType === 'INTERNAL' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Warehouse</label>
                  <select
                    value={locWarehouseId}
                    onChange={(e) => setLocWarehouseId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-1.5 bg-[#714B67] text-white rounded-lg text-xs font-bold hover:bg-[#593952]"
                >
                  {loading ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
