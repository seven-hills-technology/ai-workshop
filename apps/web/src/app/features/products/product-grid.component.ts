import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/cart/cart.service';
import { ProductCardComponent } from './product-card.component';
import {
  ProductListItem,
  ProductsApiService,
} from './products-api.service';

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

      @if (errorMessage()) {
        <div class="error" role="alert">{{ errorMessage() }}</div>
      }

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
      .error {
        margin: 16px 0;
        padding: 10px 14px;
        border: 1px solid #fecaca;
        background: #fef2f2;
        color: #b91c1c;
        border-radius: 6px;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class ProductGridComponent implements OnInit {
  private readonly api = inject(ProductsApiService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<ProductListItem[]>([]);
  readonly categories = signal<string[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasMore = computed(
    () => this.products().length < this.total(),
  );

  selectedCategory = '';
  searchQuery = '';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly limit = 20;

  constructor() {
    // When the cart mutates, re-fetch the currently visible products so each
    // card's availableStock reflects the new reservation totals. Wrap the call
    // in untracked() so that signal reads inside refreshLoaded (notably
    // this.products()) are NOT tracked as dependencies of this effect —
    // otherwise every products.update() from loadMore would retrigger the
    // refresh, wiping the appended page and causing a feedback loop.
    effect(() => {
      const v = this.cartService.mutationVersion();
      if (v === 0) return;
      untracked(() => this.refreshLoaded());
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.selectedCategory = params['category'] ?? '';
        this.searchQuery = params['search'] ?? '';
        this.loadProducts(true);
      });

    this.api
      .categories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => this.categories.set(cats),
        error: () => {
          /* non-fatal: categories filter just stays empty */
        },
      });
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
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const skip = reset ? 0 : this.products().length;

    this.api
      .list({
        skip,
        limit: this.limit,
        category: this.selectedCategory || undefined,
        search: this.searchQuery || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (reset) {
            this.products.set(res.products);
          } else {
            this.products.update((list) => [...list, ...res.products]);
          }
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Unable to load products. Please try again.');
        },
      });
  }

  // Re-fetch the window of products that's currently loaded so cards repaint
  // with fresh availableStock after a cart mutation. Deferred while a
  // loadMore is in flight — stale availability is acceptable for the split
  // second until the next mutation or filter change reconciles.
  private refreshLoaded(): void {
    if (this.loading()) return;
    const length = this.products().length;
    if (length === 0) return;

    this.api
      .list({
        skip: 0,
        limit: length,
        category: this.selectedCategory || undefined,
        search: this.searchQuery || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.products);
          this.total.set(res.total);
        },
        error: () => {
          /* keep stale list; next mutation will retry */
        },
      });
  }
}
