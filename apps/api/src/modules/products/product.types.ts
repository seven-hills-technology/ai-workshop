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
};
