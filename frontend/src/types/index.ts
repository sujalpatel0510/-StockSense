export type Role = 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF';

export type LocationType = 'INTERNAL' | 'VENDOR' | 'CUSTOMER' | 'INVENTORY_LOSS' | 'TRANSIT';

export type OperationType = 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';

export type OperationStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';

export type MoveStatus = 'DONE' | 'CANCELED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  locations?: Location[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  warehouseId?: string;
  warehouse?: Warehouse;
  name: string;
  code: string;
  type: LocationType;
  isScrap: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  _count?: {
    products: number;
  };
}

export interface StockQuant {
  id: string;
  productId: string;
  locationId: string;
  location: Location;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  category?: ProductCategory;
  uom: string;
  costPrice: number;
  salePrice: number;
  minStockRule: number;
  maxStockRule: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  quants?: StockQuant[];
  stockMoves?: StockMove[];
}

export interface TransferLine {
  id?: string;
  productId: string;
  product?: Product;
  demandQty: number;
  doneQty: number;
  uom: string;
}

export interface OperationTransfer {
  id: string;
  reference: string;
  type: OperationType;
  status: OperationStatus;
  partnerName?: string;
  sourceLocationId: string;
  sourceLocation: Location;
  destLocationId: string;
  destLocation: Location;
  scheduledDate: string;
  effectiveDate?: string;
  notes?: string;
  createdById?: string;
  createdBy?: { id: string; fullName: string; email: string };
  lines: TransferLine[];
}

export interface StockMove {
  id: string;
  reference: string;
  transferId?: string;
  transfer?: { id: string; reference: string; type: OperationType; partnerName?: string };
  productId: string;
  product: { id: string; name: string; sku: string; uom: string };
  sourceLocationId: string;
  sourceLocation: { id: string; name: string; code: string; type: LocationType };
  destLocationId: string;
  destLocation: { id: string; name: string; code: string; type: LocationType };
  quantity: number;
  uom: string;
  status: MoveStatus;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  kpis: {
    totalProductsCount: number;
    totalItemsInStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    internalScheduled: number;
  };
  operationsSummary: {
    receipts: { toProcess: number; total: number };
    deliveries: { toProcess: number; total: number };
    internal: { toProcess: number; total: number };
    adjustments: { total: number };
  };
  categoryStats: {
    category: string;
    productCount: number;
    totalQty: number;
  }[];
  recentMoves: StockMove[];
}
