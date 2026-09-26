import React, { useState } from 'react';
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
} from 'lucide-react';
import { Product, ProductCategory, Location } from '../types';
import api from '../services/api';

interface ProductsPageProps {
  products: Product[];
  categories: ProductCategory[];
  locations: Location[];
  onRefresh: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  locations,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLocationViewOpen, setIsLocationViewOpen] = useState(false);

  // New Product Form State
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

  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

      setIsCreateModalOpen(false);
      resetForm();
      onRefresh();
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

      setIsEditModalOpen(false);
      onRefresh();
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

  const openEditModal = (p: Product) => {
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
    setIsEditModalOpen(true);
  };

  const openLocationView = (p: Product) => {
    setSelectedProduct(p);
    setIsLocationViewOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Products & Stock Catalog</h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {filteredProducts.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage product Master Data, SKUs, reordering min/max rules, and per-location inventory balances.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product Name, SKU code or Barcode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Stock Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700"
        >
          <option value="">All Stock Status</option>
          <option value="IN_STOCK">🟢 In Stock</option>
          <option value="LOW_STOCK">🟡 Low Stock Alert</option>
          <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">UoM</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">Sale Price</th>
                <th className="py-3 px-3 text-center">Reorder Rules (Min/Max)</th>
                <th className="py-3 px-3 text-right">On Hand</th>
                <th className="py-3 px-3 text-right">Available</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockStatus === 'LOW_STOCK';
                  const isOut = p.stockStatus === 'OUT_OF_STOCK';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[11px] text-purple-700 font-semibold">{p.sku}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                          {p.category?.name || 'General'}
                        </span>
                      </td>

                      {/* UoM */}
                      <td className="py-3 px-3 text-slate-600 font-medium">{p.uom}</td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-mono text-slate-600">₹{p.costPrice.toFixed(2)}</td>

                      {/* Sale Price */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        ₹{p.salePrice.toFixed(2)}
                      </td>

                      {/* Reorder Rules */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                        <span className="text-amber-700 font-semibold">Min: {p.minStockRule}</span>
                        <span className="mx-1 text-slate-300">|</span>
                        <span className="text-blue-700 font-semibold">Max: {p.maxStockRule}</span>
                      </td>

                      {/* On Hand */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => openLocationView(p)}
                          className="font-mono font-bold text-slate-900 underline hover:text-purple-700 transition"
                          title="Click to view locations breakdown"
                        >
                          {p.totalOnHand} {p.uom}
                        </button>
                      </td>

                      {/* Available */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {p.totalAvailable} {p.uom}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {isOut ? (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => openLocationView(p)}
                            title="Stock per Location"
                            className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product & Reordering"
                            className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Per Location Modal (Wireframe Component) */}
      {isLocationViewOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedProduct.name}</h3>
                  <p className="text-xs font-mono text-purple-700">{selectedProduct.sku}</p>
                </div>
              </div>
              <button
                onClick={() => setIsLocationViewOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Stock Availability Per Location
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3 text-right">On Hand</th>
                      <th className="py-2 px-3 text-right">Reserved</th>
                      <th className="py-2 px-3 text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedProduct.quants && selectedProduct.quants.length > 0 ? (
                      selectedProduct.quants
                        .filter((q) => q.location.type === 'INTERNAL')
                        .map((q) => (
                          <tr key={q.id}>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              <div>{q.location.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{q.location.code}</div>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {q.quantity} {selectedProduct.uom}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">
                              {q.reservedQuantity} {selectedProduct.uom}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              {Math.max(0, q.quantity - q.reservedQuantity)} {selectedProduct.uom}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          No stock quants found in internal locations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsLocationViewOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-700" />
                Add New Inventory Product
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Steel Rods 10mm"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. RAW-STL-10"
                    className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure (UoM) *</label>
                  <select
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="Units">Units</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="Meters">Meters</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Reordering Rules */}
              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg">
                <span className="block text-xs font-bold text-purple-900 mb-2">
                  Automated Reordering Rules (Safety Stock)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Min Threshold (Alert Level)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minStockRule}
                      onChange={(e) => setMinStockRule(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Max Target Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxStockRule}
                      onChange={(e) => setMaxStockRule(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Initial Stock */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="block text-xs font-bold text-slate-800 mb-2">
                  Initial Stock (Optional Opening Balance)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opening Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Initial Location</label>
                    <select
                      value={initialLocationId}
                      onChange={(e) => setInitialLocationId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      {locations
                        .filter((l) => l.type === 'INTERNAL')
                        .map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specification details, grade, or storage notes..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Edit Product & Reordering: {selectedProduct.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Safety Stock</label>
                  <input
                    type="number"
                    value={minStockRule}
                    onChange={(e) => setMinStockRule(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-lg font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Target Stock</label>
                  <input
                    type="number"
                    value={maxStockRule}
                    onChange={(e) => setMaxStockRule(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-lg font-mono bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-1.5 bg-[#714B67] text-white rounded-lg text-xs font-bold hover:bg-[#593952]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
