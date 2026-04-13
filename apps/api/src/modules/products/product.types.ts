import { Product } from './entities/product.entity';

export type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductListQuery = {
  category?: string;
  search?: string;
  skip?: number;
  limit?: number;
  lowStock?: boolean | string;
};

export type InventoryUpdateInput = {
  stock?: number;
  lowStockThreshold?: number;
};

export type BulkAdjustOperation = 'set' | 'add' | 'subtract';

export type BulkAdjustInput = {
  productIds: number[];
  operation: BulkAdjustOperation;
  value: number;
};

export type BulkAdjustSuccess = { id: number; stock: number };
export type BulkAdjustFailure = { id: number; reason: string };
export type BulkAdjustResult = {
  succeeded: BulkAdjustSuccess[];
  failed: BulkAdjustFailure[];
};
