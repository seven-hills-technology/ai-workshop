import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type ProductListItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: string;
  brand: string;
  thumbnail: string;
  rating: number;
  stock: number;
  availabilityStatus: string;
  availableStock: number;
  reservedStock: number;
};

export type ProductListResponse = {
  products: ProductListItem[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductListParams = {
  skip: number;
  limit: number;
  category?: string;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:7800/products';

  list(params: ProductListParams): Observable<ProductListResponse> {
    let httpParams = new HttpParams()
      .set('skip', params.skip)
      .set('limit', params.limit);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ProductListResponse>(this.base, { params: httpParams });
  }

  categories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/categories`);
  }
}
