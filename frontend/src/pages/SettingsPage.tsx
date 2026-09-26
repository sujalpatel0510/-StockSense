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
  Boxes,
} from 'lucide-react';
import { Warehouse, Location, LocationType } from '../types';
import api from '../services/api';
import { Button, Input, Textarea, Select, Card, Badge } from '../components/ui';
import { Drawer } from '../components/ui';
import { useData } from '../context/DataContext';

export const SettingsPage: React.FC = () => {
  const { warehouses, locations, refreshWarehouses, refreshLocations } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'warehouses' | 'locations'>('warehouses');

  // Modals
  const [isWarehouseDrawerOpen, setIsWarehouseDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);

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
      setIsWarehouseDrawerOpen(false);
      setWhName('');
      setWhCode('');
      setWhAddress('');
      await refreshWarehouses();
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
      setIsLocationDrawerOpen(false);
      setLocName('');
      setLocCode('');
      await refreshLocations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create location.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Card variant="default" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-h2 font-extrabold text-text-primary tracking-tight">System Settings</h1>
            <p className="text-caption text-text-muted mt-0.5">
              Multi-warehouse hierarchies and virtual/physical double-entry stock locations configuration.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-xl text-caption font-semibold">
          <button
            onClick={() => setActiveSubTab('warehouses')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'warehouses'
                ? 'bg-bg-surface text-text-primary shadow-xs font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Building2 className="w-4 h-4 text-brand-primary" />
            <span>Warehouses ({warehouses.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('locations')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'locations'
                ? 'bg-bg-surface text-text-primary shadow-xs font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <MapPin className="w-4 h-4 text-brand-primary" />
            <span>Locations ({locations.length})</span>
          </button>
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
          <button
            onClick={() => setFeedback(null)}
            className="text-text-muted hover:text-text-primary font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WAREHOUSES SUB-TAB */}
      {activeSubTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-body font-bold text-text-secondary">Physical Warehouses</h2>
              <p className="text-caption text-text-muted">Enterprise fulfillment hubs and regional distribution centers.</p>
            </div>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsWarehouseDrawerOpen(true)}>
              Add Warehouse
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <Card key={wh.id} variant="default" padding="md" hoverable className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm" className="font-mono">{wh.code}</Badge>
                    <Badge variant="success" size="sm" dot>Active</Badge>
                  </div>
                  <h3 className="font-bold text-body text-text-primary mt-3">{wh.name}</h3>
                  <p className="text-caption text-text-muted mt-1">{wh.address || 'No physical address specified'}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-caption text-text-muted">
                  <span className="font-medium text-text-secondary">Locations mapped: {wh.locations?.length || 3}</span>
                  <span className="font-mono text-micro">ID: {wh.id.slice(0, 8)}...</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* LOCATIONS SUB-TAB */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-body font-bold text-text-secondary">Inventory Locations Hierarchy</h2>
              <p className="text-caption text-text-muted">
                Double-entry model incorporates physical internal zones alongside virtual supplier and customer endpoints.
              </p>
            </div>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsLocationDrawerOpen(true)}>
              Add Location
            </Button>
          </div>

          <Card variant="default" padding="none" className="overflow-hidden">
            <table className="w-full text-left text-caption">
              <thead className="bg-bg-elevated/50 border-b border-border-subtle text-text-muted font-bold uppercase text-micro">
                <tr>
                  <th className="py-3.5 px-4">Location Name</th>
                  <th className="py-3.5 px-3">Code</th>
                  <th className="py-3.5 px-3">Parent Warehouse</th>
                  <th className="py-3.5 px-3">Location Type</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-text-primary">{loc.name}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-brand-primary">{loc.code}</td>
                    <td className="py-3.5 px-3 text-text-secondary font-medium">
                      {loc.warehouse?.name || '— (Virtual / Global Endpoint)'}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge
                        variant={
                          loc.type === 'INTERNAL' ? 'info' :
                          loc.type === 'VENDOR' ? 'primary' :
                          loc.type === 'CUSTOMER' ? 'success' :
                          'danger'
                        }
                        size="sm"
                      >
                        {loc.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-status-success-text font-semibold text-caption">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Warehouse Drawer */}
      <Drawer
        isOpen={isWarehouseDrawerOpen}
        onClose={() => setIsWarehouseDrawerOpen(false)}
        title="Add Warehouse Facility"
        size="md"
      >
        <form onSubmit={handleCreateWarehouse} className="mt-4 space-y-3.5">
          <div>
            <label className="label-base">Warehouse Name *</label>
            <Input
              type="text"
              required
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              placeholder="e.g. Surat Regional Hub"
            />
          </div>

          <div>
            <label className="label-base">Short Code *</label>
            <Input
              type="text"
              required
              value={whCode}
              onChange={(e) => setWhCode(e.target.value)}
              placeholder="e.g. WH-SRT"
              className="font-mono uppercase"
            />
            <p className="text-micro text-text-muted mt-1">
              Default internal locations (Stock, Input, Output) are automatically provisioned.
            </p>
          </div>

          <div>
            <label className="label-base">Physical Address</label>
            <Textarea
              rows={2}
              value={whAddress}
              onChange={(e) => setWhAddress(e.target.value)}
              placeholder="Street, City, Postal Code..."
            />
          </div>

          {feedback && feedback.type === 'error' && (
            <div className="p-3 bg-status-danger-bg border border-status-danger-border text-status-danger-text rounded-xl text-caption">
              {feedback.message}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setIsWarehouseDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Warehouse'}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Location Drawer */}
      <Drawer
        isOpen={isLocationDrawerOpen}
        onClose={() => setIsLocationDrawerOpen(false)}
        title="Add Inventory Location"
        size="md"
      >
        <form onSubmit={handleCreateLocation} className="mt-4 space-y-3.5">
          <div>
            <label className="label-base">Location Name *</label>
            <Input
              type="text"
              required
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              placeholder="e.g. Shelf Rack C-03 or Heavy Staging Dock"
            />
          </div>

          <div>
            <label className="label-base">Short Code *</label>
            <Input
              type="text"
              required
              value={locCode}
              onChange={(e) => setLocCode(e.target.value)}
              placeholder="e.g. WH1/RACK-C"
              className="font-mono uppercase"
            />
          </div>

          <div>
            <label className="label-base">Location Type</label>
            <Select
              value={locType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLocType(e.target.value as LocationType)}
              options={[
                { value: 'INTERNAL', label: 'Internal Physical Warehouse Location' },
                { value: 'VENDOR', label: 'Vendor / Supplier Virtual Endpoint' },
                { value: 'CUSTOMER', label: 'Customer Delivery Virtual Endpoint' },
                { value: 'INVENTORY_LOSS', label: 'Inventory Scrap / Loss Virtual Location' },
              ]}
            />
          </div>

          {locType === 'INTERNAL' && (
            <div>
              <label className="label-base">Parent Warehouse</label>
              <Select
                value={locWarehouseId}
                onChange={(e) => setLocWarehouseId(e.target.value)}
                options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
              />
            </div>
          )}

          {feedback && feedback.type === 'error' && (
            <div className="p-3 bg-status-danger-bg border border-status-danger-border text-status-danger-text rounded-xl text-caption">
              {feedback.message}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setIsLocationDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};