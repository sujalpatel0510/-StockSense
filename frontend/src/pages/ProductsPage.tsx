import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  MapPin,
  TrendingDown,
  Layers,
  Edit2,
  Info,
  CheckCircle,
  X,
  LayoutGrid,
  List,
  DollarSign,
  TrendingUp,
  Boxes,
  Percent,
} from 'lucide-react';
import { Product, ProductCategory, Location } from '../types';
import api from '../services/api';
import { StatusBadge, Badge } from '../components/ui';
import { StatCard, Card } from '../components/ui';
import { EmptyState } from '../components/ui';
import { Button, Input, Select } from '../components/ui';
import { Drawer } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    products, 
    categories, 
    locations, 
    refreshProducts,
    refreshWarehouses,
    refreshLocations,
    refreshCategories,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [uom, setUom] = useState('Units');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [minStockRule, setMinStockRule] = useState<number>(10);
  const [maxStockRule, setMaxStockRule] = useState<number>(100);
  const [initialStock, setInitialStock] = useState<number>(0);
  const [initialLocationId, setInitialLocationId] = useState(
    locations.find((l) => l.type === 'INTERNAL')?.id || ''
  );
  const [description, setDescription] = useState('');

  // Handle URL query parameters (?status=LOW_STOCK, ?new=true)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
    if (searchParams.get('new') === 'true') {
      setIsCreateDrawerOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Ensure category and location are populated once loaded
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (!initialLocationId && locations.length > 0) {
      const internalLoc = locations.find((l) => l.type === 'INTERNAL')?.id || locations[0]?.id;
      if (internalLoc) setInitialLocationId(internalLoc);
    }
  }, [locations, initialLocationId]);

  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Financial Metrics
  const totalCostValuation = products.reduce((acc, p) => acc + p.totalOnHand * p.costPrice, 0);
  const totalSaleValuation = products.reduce((acc, p) => acc + p.totalOnHand * p.salePrice, 0);
  const lowStockCount = products.filter((p) => p.stockStatus === 'LOW_STOCK').length;
  const outOfStockCount = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.barcode && prod.barcode.includes(searchTerm));

    const matchesCategory = selectedCategory ? prod.categoryId === selectedCategory : true;
    const matchesStatus = statusFilter ? prod.stockStatus === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModalError(null);

    try {
      await api.createProduct({
        name,
        sku,
        barcode: barcode || null,
        categoryId: categoryId || categories[0]?.id,
        uom,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        minStockRule: Number(minStockRule),
        maxStockRule: Number(maxStockRule),
        initialStock: Number(initialStock),
        initialLocationId: initialLocationId || undefined,
        description,
      });

      setIsCreateDrawerOpen(false);
      resetForm();
      await refreshProducts();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setLoading(true);
    setModalError(null);

    try {
      await api.updateProduct(selectedProduct.id, {
        name,
        categoryId,
        uom,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        minStockRule: Number(minStockRule),
        maxStockRule: Number(maxStockRule),
        description,
      });

      setIsEditDrawerOpen(false);
      await refreshProducts();
    } catch (err: any) {
      setModalError(err.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setBarcode('');
    setCategoryId(categories[0]?.id || '');
    setUom('Units');
    setCostPrice(0);
    setSalePrice(0);
    setMinStockRule(10);
    setMaxStockRule(100);
    setInitialStock(0);
    setDescription('');
  };

  const openEditDrawer = (p: Product) => {
    setSelectedProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setCategoryId(p.categoryId);
    setUom(p.uom);
    setCostPrice(p.costPrice);
    setSalePrice(p.salePrice);
    setMinStockRule(p.minStockRule);
    setMaxStockRule(p.maxStockRule);
    setDescription(p.description || '');
    setIsEditDrawerOpen(true);
  };

  const openLocationDrawer = (p: Product) => {
    setSelectedProduct(p);
    setIsLocationDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-h2 font-extrabold text-text-primary tracking-tight">Products & Stock Assets</h1>
            <Badge variant="info" size="sm">{filteredProducts.length} Items</Badge>
          </div>
          <p className="text-body-sm text-text-muted mt-1">
            Product master data, SKU references, reordering limits, and per-location inventory availability.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateDrawerOpen(true)}>
          Add New Product
        </Button>
      </div>

      {/* Role Feature Specification Banner */}
      {user?.role === 'WAREHOUSE_STAFF' ? (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-900 font-mono font-black text-micro tracking-wide border border-amber-300 shrink-0">
              WAREHOUSE STAFF ROLE
            </span>
            <div className="text-xs">
              <span className="font-bold">Staff Operational View:</span> Checking stock availability per location rack/bin, SKU codes, and barcodes for picking and shelving. Master product creation & reordering limits are maintained by <strong>Inventory Managers</strong>.
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded text-amber-800 border border-amber-200 shrink-0">
            Picking & Shelving Mode
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-200/80 text-indigo-900 font-mono font-black text-micro tracking-wide border border-indigo-300 shrink-0">
              INVENTORY MANAGER ROLE
            </span>
            <div className="text-xs">
              <span className="font-bold">Manager Master Data View:</span> Full control to create/update products, configure Min/Max reordering limits (safety stock rules), edit unit purchase/selling prices, and analyze margin valuations.
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded text-indigo-800 border border-indigo-200 shrink-0">
            Master Data & Rules Mode
          </span>
        </div>
      )}

      {/* Asset KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Catalog Items"
          value={products.length}
          subtitle="Registered SKU Master Data"
          icon={Boxes}
          iconColor="text-brand-primary"
          iconBg="bg-brand-primary/10"
        />

        <StatCard
          title="Total Inventory Valuation"
          value={`₹${totalCostValuation.toLocaleString('en-IN')}`}
          subtitle="At acquisition cost price"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badge={{ text: 'Cost Basis', variant: 'positive' }}
        />

        <StatCard
          title="Potential Sales Value"
          value={`₹${totalSaleValuation.toLocaleString('en-IN')}`}
          subtitle="At retail catalogue rate"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badge={{
            text: `${totalSaleValuation > 0 ? Math.round(((totalSaleValuation - totalCostValuation) / totalSaleValuation) * 100) : 0}% Margin`,
            variant: 'positive',
          }}
        />

        <StatCard
          title="Safety Watchlist"
          value={lowStockCount + outOfStockCount}
          subtitle={`${lowStockCount} low stock, ${outOfStockCount} depleted`}
          icon={AlertTriangle}
          iconColor="text-brand-warning"
          iconBg="bg-brand-warning/10"
          badge={{
            text: lowStockCount > 0 ? 'Action Needed' : 'Nominal',
            variant: lowStockCount > 0 ? 'warning' : 'positive',
          }}
          onClick={() => setStatusFilter(statusFilter === 'LOW_STOCK' ? '' : 'LOW_STOCK')}
        />
      </div>

      {/* Filter and View Bar */}
      <div className="bg-bg-surface p-4 rounded-2xl shadow-xs border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, SKU code or barcode..."
              className="pl-9 pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            className="w-auto min-w-[180px]"
          />

          {/* Stock Status Pills */}
          <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-xl text-caption">
            {[
              { id: '', label: 'All' },
              { id: 'IN_STOCK', label: 'In Stock' },
              { id: 'LOW_STOCK', label: 'Low Stock' },
              { id: 'OUT_OF_STOCK', label: 'Depleted' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-caption font-semibold transition ${
                  statusFilter === st.id
                    ? 'bg-bg-surface text-text-primary shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-xl shrink-0 self-end md:self-auto">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product Content: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description={
            searchTerm || selectedCategory || statusFilter
              ? 'No products matched your specific search filters. Try clearing filters to view all products.'
              : 'Your product catalog is empty. Click "Add New Product" to create your first inventory asset.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setStatusFilter('');
          }}
        />
      ) : viewMode === 'table' ? (
        <div className="bg-bg-surface rounded-2xl shadow-xs border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead className="bg-bg-elevated/50 border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-micro">
                <tr>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3 text-right">Cost</th>
                  <th className="py-3.5 px-3 text-right">Sale Price</th>
                  <th className="py-3.5 px-3 text-center">Reordering Rules</th>
                  <th className="py-3.5 px-3 text-right">On Hand</th>
                  <th className="py-3.5 px-3 text-right">Available</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-elevated/50 transition-colors">
                    {/* Product Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-text-primary">{p.name}</div>
                      <div className="text-micro font-mono text-brand-primary font-semibold">{p.sku}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <Badge variant="neutral" size="sm">{p.category?.name || 'General'}</Badge>
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-text-secondary">
                      ₹{p.costPrice.toFixed(2)}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-semibold text-text-primary">
                      ₹{p.salePrice.toFixed(2)}
                    </td>

                    {/* Reorder Rules */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums text-micro">
                      <span className="text-brand-warning font-semibold">Min: {p.minStockRule}</span>
                      <span className="mx-1 text-text-muted">|</span>
                      <span className="text-brand-primary font-semibold">Max: {p.maxStockRule}</span>
                    </td>

                    {/* On Hand */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openLocationDrawer(p)}
                        className="font-mono tabular-nums font-semibold text-text-primary hover:text-brand-primary transition flex items-center justify-end gap-1 ml-auto"
                        title="Click to view locations breakdown"
                      >
                        <span>{p.totalOnHand} {p.uom}</span>
                        <MapPin className="w-3 h-3 text-text-muted" />
                      </button>
                    </td>

                    {/* Available */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {p.totalAvailable} {p.uom}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={p.stockStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openLocationDrawer(p)} title="Stock per Location">
                          <MapPin className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDrawer(p)} title="Edit Product">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const stockPct = p.maxStockRule > 0 ? Math.min(100, Math.round((p.totalOnHand / p.maxStockRule) * 100)) : 0;

            return (
              <Card key={p.id} variant="default" padding="md" hoverable className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="primary" size="sm" className="font-mono">{p.sku}</Badge>
                      <h3 className="font-bold text-body text-text-primary mt-2">{p.name}</h3>
                      <p className="text-caption text-text-muted mt-0.5">{p.category?.name || 'General'}</p>
                    </div>
                    <StatusBadge status={p.stockStatus} />
                  </div>

                  {/* Stock progress */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-caption">
                      <span className="text-text-muted font-medium">On-Hand Inventory:</span>
                      <span className="font-mono tabular-nums font-bold text-text-primary">
                        {p.totalOnHand} / {p.maxStockRule} {p.uom}
                      </span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          p.stockStatus === 'OUT_OF_STOCK'
                            ? 'bg-brand-danger'
                            : p.stockStatus === 'LOW_STOCK'
                            ? 'bg-brand-warning'
                            : 'bg-brand-primary'
                        }`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-micro text-text-muted font-mono">
                      <span>Safety Min: {p.minStockRule}</span>
                      <span>Target Max: {p.maxStockRule}</span>
                    </div>
                  </div>

                  {/* Financial Valuation */}
                  <div className="mt-4 p-3 bg-bg-elevated/50 rounded-xl border border-border-subtle grid grid-cols-2 gap-2 text-caption">
                    <div>
                      <span className="text-micro text-text-muted font-medium block">Cost Valuation</span>
                      <span className="font-mono tabular-nums font-bold text-text-secondary">
                        ₹{(p.totalOnHand * p.costPrice).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-micro text-text-muted font-medium block">Sale Value</span>
                      <span className="font-mono tabular-nums font-bold text-emerald-700">
                        ₹{(p.totalOnHand * p.salePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <Button variant="ghost" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />} onClick={() => openLocationDrawer(p)}>
                    Locations
                  </Button>

                  <Button variant="secondary" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEditDrawer(p)}>
                    Edit
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stock Per Location Breakdown Drawer */}
      <Drawer
        isOpen={isLocationDrawerOpen}
        onClose={() => setIsLocationDrawerOpen(false)}
        title="Stock Availability Per Location"
        size="lg"
      >
        {selectedProduct && (
          <div className="my-5">
            <h4 className="text-caption font-bold uppercase text-text-muted tracking-wider mb-2.5">
              Stock Availability Per Physical Location
            </h4>
            <div className="border border-border-subtle rounded-xl overflow-hidden">
              <table className="w-full text-left text-caption">
                <thead className="bg-bg-elevated border-b border-border-subtle text-text-muted font-semibold text-micro">
                  <tr>
                    <th className="py-2.5 px-3">Location / Bin</th>
                    <th className="py-2.5 px-3 text-right">On Hand</th>
                    <th className="py-2.5 px-3 text-right">Reserved</th>
                    <th className="py-2.5 px-3 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {selectedProduct.quants && selectedProduct.quants.length > 0 ? (
                    selectedProduct.quants
                      .filter((q) => q.location.type === 'INTERNAL')
                      .map((q) => (
                        <tr key={q.id}>
                          <td className="py-2.5 px-3 font-medium text-text-primary">
                            <div>{q.location.name}</div>
                            <div className="text-micro text-text-muted font-mono">{q.location.code}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-text-primary">
                            {q.quantity} {selectedProduct.uom}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-text-muted">
                            {q.reservedQuantity} {selectedProduct.uom}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                            {Math.max(0, q.quantity - q.reservedQuantity)} {selectedProduct.uom}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-muted">
                        No stock recorded in internal warehouse locations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Product Drawer */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Add New Inventory Product"
        size="xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label-base">Product Name *</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Steel Rods 10mm"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label-base">SKU / Code *</label>
              <Input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. RAW-STL-10"
                className="uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Category *</label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div>
              <label className="label-base">Unit of Measure (UoM) *</label>
              <Select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                options={[
                  { value: 'Units', label: 'Units' },
                  { value: 'kg', label: 'kg (Kilograms)' },
                  { value: 'Meters', label: 'Meters' },
                  { value: 'Boxes', label: 'Boxes' },
                  { value: 'Liters', label: 'Liters' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Cost Price (₹)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="label-base">Sales Price (₹)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Reordering Rules */}
          <div className="p-3.5 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
            <span className="block text-caption font-bold text-brand-primary/90 mb-2">
              Automated Reordering Limits (Safety Stock)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base text-micro">Min Threshold (Alert Level)</label>
                <Input
                  type="number"
                  min="0"
                  value={minStockRule}
                  onChange={(e) => setMinStockRule(Number(e.target.value))}
                  className="font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="label-base text-micro">Max Target Stock</label>
                <Input
                  type="number"
                  min="0"
                  value={maxStockRule}
                  onChange={(e) => setMaxStockRule(Number(e.target.value))}
                  className="font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Opening Stock */}
          <div className="p-3.5 bg-bg-elevated border border-border-subtle rounded-xl">
            <span className="block text-caption font-bold text-text-secondary mb-2">
              Initial Stock (Optional Opening Balance)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base text-micro">Opening Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(Number(e.target.value))}
                  placeholder="0"
                  className="font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="label-base text-micro">Initial Location</label>
                <Select
                  value={initialLocationId}
                  onChange={(e) => setInitialLocationId(e.target.value)}
                  options={locations
                    .filter((l) => l.type === 'INTERNAL')
                    .map((loc) => ({ value: loc.id, label: loc.name }))}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label-base">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specification details, grade or storage instructions..."
              className="input-base resize-y"
            />
          </div>

          {modalError && (
            <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-xl text-caption">
              {modalError}
            </div>
          )}

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setIsCreateDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Product Drawer */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={`Edit Product: ${selectedProduct?.name}`}
        size="lg"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-3.5">
          <div>
            <label className="label-base">Product Name</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Cost Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="label-base">Sales Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
            <div>
              <label className="label-base text-micro">Min Safety Limit</label>
              <Input
                type="number"
                value={minStockRule}
                onChange={(e) => setMinStockRule(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="label-base text-micro">Max Target Stock</label>
              <Input
                type="number"
                value={maxStockRule}
                onChange={(e) => setMaxStockRule(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
          </div>

          {modalError && (
            <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-xl text-caption">
              {modalError}
            </div>
          )}

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setIsEditDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};