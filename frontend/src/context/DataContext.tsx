import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import {
  DashboardStats,
  Product,
  ProductCategory,
  Warehouse,
  Location,
  OperationTransfer,
  StockMove,
} from '../types';

interface DataContextType {
  // Data
  dashboardStats: DashboardStats | null;
  products: Product[];
  categories: ProductCategory[];
  warehouses: Warehouse[];
  locations: Location[];
  transfers: OperationTransfer[];
  moves: StockMove[];
  adjustments: OperationTransfer[];
  
  // Computed
  lowStockCount: number;
  outOfStockCount: number;
  
  // Loading states
  loading: boolean;
  
  // Selected warehouse
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  
  // Actions
  fetchAllData: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
  refreshMoves: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshWarehouses: () => Promise<void>;
  refreshLocations: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [transfers, setTransfers] = useState<OperationTransfer[]>([]);
  const [moves, setMoves] = useState<StockMove[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const adjustments = useMemo(() => 
    transfers.filter((t) => t.type === 'ADJUSTMENT'), 
    [transfers]
  );

  const lowStockCount = useMemo(() => 
    products.filter((p) => p.stockStatus === 'LOW_STOCK').length, 
    [products]
  );

  const outOfStockCount = useMemo(() => 
    products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length, 
    [products]
  );

  const fetchAllData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const [
        statsRes,
        prodRes,
        catRes,
        whRes,
        locRes,
        transRes,
        movesRes,
      ] = await Promise.all([
        api.getDashboardStats(selectedWarehouseId || undefined),
        api.getProducts({ warehouseId: selectedWarehouseId || undefined }),
        api.getCategories(),
        api.getWarehouses(),
        api.getLocations({ warehouseId: selectedWarehouseId || undefined }),
        api.getTransfers({ warehouseId: selectedWarehouseId || undefined }),
        api.getMoves({ warehouseId: selectedWarehouseId || undefined }),
      ]);

      if (statsRes?.success) setDashboardStats(statsRes.data);
      if (prodRes?.success) setProducts(prodRes.data);
      if (catRes?.success) setCategories(catRes.data);
      if (whRes?.success) setWarehouses(whRes.data);
      if (locRes?.success) setLocations(locRes.data);
      if (transRes?.success) setTransfers(transRes.data);
      if (movesRes?.success) setMoves(movesRes.data);
    } catch (error) {
      console.error('Error fetching StockSense data:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await api.getProducts({ warehouseId: selectedWarehouseId || undefined });
      if (res.success) setProducts(res.data);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, [selectedWarehouseId]);

  const refreshTransfers = useCallback(async () => {
    try {
      const res = await api.getTransfers({ warehouseId: selectedWarehouseId || undefined });
      if (res.success) setTransfers(res.data);
    } catch (error) {
      console.error('Error refreshing transfers:', error);
    }
  }, [selectedWarehouseId]);

  const refreshMoves = useCallback(async () => {
    try {
      const res = await api.getMoves({ warehouseId: selectedWarehouseId || undefined });
      if (res.success) setMoves(res.data);
    } catch (error) {
      console.error('Error refreshing moves:', error);
    }
  }, [selectedWarehouseId]);

  const refreshDashboard = useCallback(async () => {
    try {
      const res = await api.getDashboardStats(selectedWarehouseId || undefined);
      if (res.success) setDashboardStats(res.data);
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error);
    }
  }, [selectedWarehouseId]);

  const refreshWarehouses = useCallback(async () => {
    try {
      const res = await api.getWarehouses();
      if (res.success) setWarehouses(res.data);
    } catch (error) {
      console.error('Error refreshing warehouses:', error);
    }
  }, []);

  const refreshLocations = useCallback(async () => {
    try {
      const res = await api.getLocations();
      if (res.success) setLocations(res.data);
    } catch (error) {
      console.error('Error refreshing locations:', error);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    dashboardStats,
    products,
    categories,
    warehouses,
    locations,
    transfers,
    moves,
    adjustments,
    lowStockCount,
    outOfStockCount,
    loading,
    selectedWarehouseId,
    setSelectedWarehouseId,
    fetchAllData,
    refreshProducts,
    refreshTransfers,
    refreshMoves,
    refreshDashboard,
    refreshWarehouses,
    refreshLocations,
    refreshCategories,
  }), [
    dashboardStats,
    products,
    categories,
    warehouses,
    locations,
    transfers,
    moves,
    adjustments,
    lowStockCount,
    outOfStockCount,
    loading,
    selectedWarehouseId,
    fetchAllData,
    refreshProducts,
    refreshTransfers,
    refreshMoves,
    refreshDashboard,
    refreshWarehouses,
    refreshLocations,
    refreshCategories,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};