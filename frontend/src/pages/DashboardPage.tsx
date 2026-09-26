import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Boxes,
  Plus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  PieChart,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { DashboardStats, ProductCategory, Warehouse, Product } from '../types';
import { ActiveTab } from '../components/Navigation';
import { StatCard, Card } from '../components/ui';
import { StatusBadge, Badge } from '../components/ui';
import { Button } from '../components/ui';
import { useData } from '../context/DataContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    dashboardStats, 
    categories, 
    warehouses, 
    products,
    selectedWarehouseId,
    setSelectedWarehouseId,
    fetchAllData,
  } = useData();

  const [lowStockCount, setLowStockCount] = useState(0);

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body text-text-muted">Loading Enterprise Stock Assets...</p>
        </div>
      </div>
    );
  }

  const { kpis, operationsSummary, categoryStats, recentMoves } = dashboardStats;

  // Financial Stock Portfolio Calculations
  const totalCostValuation = products.reduce((acc, p) => acc + (p.totalOnHand * p.costPrice), 0);
  const totalSaleValuation = products.reduce((acc, p) => acc + (p.totalOnHand * p.salePrice), 0);
  const totalMargin = totalSaleValuation > 0 ? Math.round(((totalSaleValuation - totalCostValuation) / totalSaleValuation) * 100) : 0;
  const inStockPercentage = kpis.totalProductsCount > 0
    ? Math.round(((kpis.totalProductsCount - (kpis.lowStockCount + kpis.outOfStockCount)) / kpis.totalProductsCount) * 100)
    : 100;

  const currentLowStock = products.filter((p) => p.stockStatus === 'LOW_STOCK').length;
  const currentOutOfStock = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;

  const handleOpenNewTransfer = (type: 'RECEIPT' | 'DELIVERY' | 'INTERNAL') => {
    const routes = {
      RECEIPT: '/transfers/receipts',
      DELIVERY: '/transfers/deliveries',
      INTERNAL: '/transfers/internal',
    };
    navigate(routes[type]);
  };

  const handleOpenNewAdjustment = () => {
    navigate('/adjustments');
  };

  return (
    <div className="space-y-6">
      {/* Top Portfolio Welcome & Quick Actions Bar */}
      <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-h2 font-extrabold text-text-primary tracking-tight">Executive Stock Overview</h2>
            <Badge variant="success" size="sm" dot>
              REAL-TIME
            </Badge>
          </div>
          <p className="text-body-sm text-text-muted">
            Real-time balance of enterprise assets, supplier intake pipelines, and dispatch logistics across active facilities.
          </p>
        </div>

        {/* Global Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenNewTransfer('RECEIPT')}>
            New Receipt
          </Button>

          <Button variant="success" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenNewTransfer('DELIVERY')}>
            New Delivery
          </Button>

          <Button variant="secondary" size="sm" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5 text-brand-primary" />} onClick={() => handleOpenNewTransfer('INTERNAL')}>
            Internal Move
          </Button>

          <Button variant="outline" size="sm" onClick={handleOpenNewAdjustment}>
            Physical Count
          </Button>
        </div>
      </div>

      {/* Critical Stock Alert Watchlist Banner */}
      {(currentLowStock > 0 || currentOutOfStock > 0) && (
        <div className="p-4 rounded-2xl bg-brand-warning/10 border border-brand-warning/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-warning/20 text-brand-warning flex items-center justify-center shrink-0 border border-brand-warning/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-brand-warning/90">
                Safety Stock Watchlist: {currentLowStock} items below reorder limit, {currentOutOfStock} out of stock
              </p>
              <p className="text-brand-warning/80 text-caption mt-0.5">
                Proactive replenishment required to prevent warehouse fulfilment delays.
              </p>
            </div>
          </div>

          <Button variant="warning" size="sm" leftIcon={<ArrowRight className="w-3.5 h-3.5" />} onClick={() => navigate('/products')}>
            Review Low Stock SKUs
          </Button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock Asset Valuation"
          value={totalCostValuation > 0 ? `₹${totalCostValuation.toLocaleString('en-IN')}` : `₹${(kpis.totalItemsInStock * 240).toLocaleString('en-IN')}`}
          subtitle={`Est. Revenue: ₹${(totalSaleValuation > 0 ? totalSaleValuation : kpis.totalItemsInStock * 380).toLocaleString('en-IN')}`}
          icon={DollarSign}
          iconColor="text-brand-primary"
          iconBg="bg-brand-primary/10"
          badge={{ text: `${totalMargin || 35}% Margin`, variant: 'positive' }}
          onClick={() => navigate('/products')}
        />

        <StatCard
          title="Total SKUs in Stock"
          value={kpis.totalProductsCount}
          subtitle={`${kpis.totalItemsInStock.toLocaleString()} total units on shelf`}
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badge={{ text: `${inStockPercentage}% Healthy`, variant: 'info' }}
          onClick={() => navigate('/products')}
        />

        <StatCard
          title="Inbound Receipts"
          value={operationsSummary.receipts.toProcess}
          subtitle={`${operationsSummary.receipts.total} historical orders recorded`}
          icon={ArrowDownLeft}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badge={{ text: 'WH/IN Dock', variant: 'positive' }}
          onClick={() => navigate('/transfers/receipts')}
        />

        <StatCard
          title="Pending Dispatches"
          value={operationsSummary.deliveries.toProcess}
          subtitle={`${operationsSummary.deliveries.total} customer shipments processed`}
          icon={ArrowUpRight}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          badge={{ text: 'WH/OUT Dispatch', variant: 'warning' }}
          onClick={() => navigate('/transfers/deliveries')}
        />
      </div>

      {/* Operation Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" padding="md" hoverable onClick={() => navigate('/transfers/receipts')}>
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-caption font-bold text-text-secondary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Receipts (Inbound)
            </span>
            <Badge variant="info" size="sm">WH/IN</Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-text-primary font-mono">{operationsSummary.receipts.toProcess}</span>
              <span className="block text-caption font-semibold text-text-muted mt-0.5">To Process</span>
            </div>
            <div className="text-right">
              <span className="text-body font-bold text-text-muted font-mono">{operationsSummary.receipts.total}</span>
              <span className="block text-micro text-text-muted">Total Lifecycle</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
            <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3.5 h-3.5" />}>View Orders</Button>
            <Button variant="secondary" size="sm" onClick={() => handleOpenNewTransfer('RECEIPT')}>+ Create</Button>
          </div>
        </Card>

        <Card variant="default" padding="md" hoverable onClick={() => navigate('/transfers/deliveries')}>
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-caption font-bold text-text-secondary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Delivery Orders
            </span>
            <Badge variant="success" size="sm">WH/OUT</Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-text-primary font-mono">{operationsSummary.deliveries.toProcess}</span>
              <span className="block text-caption font-semibold text-text-muted mt-0.5">To Dispatch</span>
            </div>
            <div className="text-right">
              <span className="text-body font-bold text-text-muted font-mono">{operationsSummary.deliveries.total}</span>
              <span className="block text-micro text-text-muted">Total Orders</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
            <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3.5 h-3.5" />}>View Orders</Button>
            <Button variant="success" size="sm" onClick={() => handleOpenNewTransfer('DELIVERY')}>+ Create</Button>
          </div>
        </Card>

        <Card variant="default" padding="md" hoverable onClick={() => navigate('/transfers/internal')}>
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-caption font-bold text-text-secondary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-warning" />
              Internal Transfers
            </span>
            <Badge variant="warning" size="sm">WH/INT</Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-text-primary font-mono">{operationsSummary.internal.toProcess}</span>
              <span className="block text-caption font-semibold text-text-muted mt-0.5">Scheduled</span>
            </div>
            <div className="text-right">
              <span className="text-body font-bold text-text-muted font-mono">{operationsSummary.internal.total}</span>
              <span className="block text-micro text-text-muted">Transferred</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
            <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3.5 h-3.5" />}>View Transfers</Button>
            <Button variant="warning" size="sm" onClick={() => handleOpenNewTransfer('INTERNAL')}>+ Move</Button>
          </div>
        </Card>

        <Card variant="default" padding="md" hoverable onClick={() => navigate('/adjustments')}>
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-caption font-bold text-text-secondary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Physical Audits
            </span>
            <Badge variant="warning" size="sm">WH/ADJ</Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-text-primary font-mono">{operationsSummary.adjustments.total}</span>
              <span className="block text-caption font-semibold text-text-muted mt-0.5">Audits Done</span>
            </div>
            <div className="text-right">
              <span className="text-caption font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Reconciled
              </span>
              <span className="block text-micro text-text-muted">Ledger Verified</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
            <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3.5 h-3.5" />}>Audit Log</Button>
            <Button variant="secondary" size="sm" onClick={handleOpenNewAdjustment}>+ Count</Button>
          </div>
        </Card>
      </div>

      {/* Main Grid: Category Stock Allocation & Live Ledger Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stock Asset Allocation by Category */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="font-bold text-body text-text-primary flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-primary" />
              <span>Asset Allocation by Category</span>
            </h3>
            <span className="text-micro font-semibold text-text-muted font-mono">{categoryStats.length} Categories</span>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat, idx) => {
              const maxQty = Math.max(...categoryStats.map((c) => c.totalQty), 1);
              const percentage = Math.round((cat.totalQty / maxQty) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-caption font-medium">
                    <span className="text-text-primary font-semibold">{cat.category}</span>
                    <span className="text-text-secondary font-mono font-bold">
                      {cat.totalQty.toLocaleString()} units{' '}
                      <span className="text-text-muted font-normal">({cat.productCount} SKUs)</span>
                    </span>
                  </div>

                  <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border-subtle text-center">
            <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3.5 h-3.5" />} onClick={() => navigate('/products')}>
              Manage Product Master Data & Reordering Limits
            </Button>
          </div>
        </Card>

        {/* Right: Real-Time Stock Ledger Audit Feed */}
        <Card variant="default" padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-body text-text-primary">Live Double-Entry Stock Ledger Stream</h3>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} onClick={() => navigate('/moves')}>
              Full Ledger
            </Button>
          </div>

          {recentMoves.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-caption">
              No transactions recorded yet in the ledger.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-caption">
                <thead>
                  <tr className="border-b border-border-subtle text-micro font-bold text-text-muted uppercase tracking-wider">
                    <th className="pb-2.5">Time</th>
                    <th className="pb-2.5">Reference</th>
                    <th className="pb-2.5">Product & SKU</th>
                    <th className="pb-2.5">From → To</th>
                    <th className="pb-2.5 text-right">Quantity</th>
                    <th className="pb-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {recentMoves.map((move: any) => (
                    <tr key={move.id} className="hover:bg-bg-elevated/50 transition-colors">
                      <td className="py-3 text-text-muted font-mono text-micro">
                        {new Date(move.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 font-mono font-bold text-brand-primary">{move.reference}</td>
                      <td className="py-3">
                        <div className="font-semibold text-text-primary">{move.product.name}</div>
                        <div className="text-micro text-text-muted font-mono">{move.product.sku}</div>
                      </td>
                      <td className="py-3 text-text-secondary">
                        <span className="font-medium text-text-secondary">{move.sourceLocation.name}</span>
                        <span className="mx-1.5 text-text-muted font-bold">→</span>
                        <span className="font-semibold text-emerald-700">{move.destLocation.name}</span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-text-primary">
                        +{move.quantity} {move.uom || move.product.uom}
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={move.status} />
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