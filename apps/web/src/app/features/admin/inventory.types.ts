export type InventoryProduct = {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  availabilityStatus: string;
};

export type InventoryListResponse = {
  products: InventoryProduct[];
  total: number;
  skip: number;
  limit: number;
};

export type BulkOperation = 'set' | 'add' | 'subtract';

export type BulkAdjustResult = {
  succeeded: { id: number; stock: number }[];
  failed: { id: number; reason: string }[];
};
