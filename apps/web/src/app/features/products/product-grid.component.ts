import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from './product-card.component';

type Product = {
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
};

type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <div class="header">
      <h2>Products</h2>
      <span class="count">{{ total() }} items</span>
    </div>

    <div class="filters">
      <select
        [ngModel]="selectedCategory"
        (ngModelChange)="onCategoryChange($event)"
      >
        <option value="">All Categories</option>
        @for (cat of categories(); track cat) {
          <option [value]="cat">{{ cat }}</option>
        }
      </select>

      <input
        type="text"
        [ngModel]="searchQuery"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Search products..."
        class="search-input"
      />
    </div>

    @if (loading() && products().length === 0) {
      <div class="loading">Loading products...</div>
    } @else if (products().length === 0) {
      <div class="empty">No products found matching your filters.</div>
    } @else {
      <div class="grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" />
        }
      </div>

      @if (hasMore()) {
        <div class="load-more">
          <button (click)="loadMore()" [disabled]="loading()">
            @if (loading()) {
              Loading...
            } @else {
              Load More
            }
          </button>
        </div>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
      }
      .header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 16px;
      }
      .header h2 {
        margin: 0;
      }
      .count {
        color: var(--muted, #888);
        font-size: 0.9rem;
      }
      .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .filters select {
        padding: 8px 12px;
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 6px;
        font-size: 0.9rem;
        background: var(--card-bg, #fff);
      }
      .search-input {
        flex: 1;
        min-width: 200px;
        padding: 8px 12px;
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
      }
      .load-more {
        display: flex;
        justify-content: center;
        margin: 24px 0;
      }
      .load-more button {
        padding: 10px 32px;
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 6px;
        background: var(--card-bg, #fff);
        font-size: 0.95rem;
        cursor: pointer;
        transition: background 0.15s;
      }
      .load-more button:hover:not(:disabled) {
        background: var(--badge-bg, #f0f0f0);
      }
      .load-more button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .loading,
      .empty {
        text-align: center;
        padding: 48px 16px;
        color: var(--muted, #888);
        font-size: 1rem;
      }
    `,
  ],
})
export class ProductGridComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly hasMore = computed(
    () => this.products().length < this.total(),
  );

  selectedCategory = '';
  searchQuery = '';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly limit = 20;

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory = params['category'] ?? '';
      this.searchQuery = params['search'] ?? '';
      this.loadProducts(true);
    });

    this.http
      .get<string[]>('http://localhost:3000/products/categories')
      .subscribe((cats) => this.categories.set(cats));
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.updateUrl();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.updateUrl(), 300);
  }

  loadMore(): void {
    this.loadProducts(false);
  }

  private updateUrl(): void {
    const queryParams: Record<string, string> = {};
    if (this.selectedCategory) queryParams['category'] = this.selectedCategory;
    if (this.searchQuery) queryParams['search'] = this.searchQuery;
    this.router.navigate([], { queryParams, queryParamsHandling: 'replace' });
  }

  private loadProducts(reset: boolean): void {
    this.loading.set(true);
    const skip = reset ? 0 : this.products().length;

    let url = `http://localhost:3000/products?skip=${skip}&limit=${this.limit}`;
    if (this.selectedCategory) url += `&category=${encodeURIComponent(this.selectedCategory)}`;
    if (this.searchQuery) url += `&search=${encodeURIComponent(this.searchQuery)}`;

    this.http.get<ProductListResponse>(url).subscribe((res) => {
      if (reset) {
        this.products.set(res.products);
      } else {
        this.products.update((list) => [...list, ...res.products]);
      }
      this.total.set(res.total);
      this.loading.set(false);
    });
  }
}
