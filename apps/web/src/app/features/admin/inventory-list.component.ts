import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryTableComponent } from './inventory-table.component';
import { BulkActionBarComponent } from './bulk-action-bar.component';
import {
  API_BASE,
  BulkAdjustResult,
  BulkOperation,
  InventoryListResponse,
  InventoryProduct,
} from './inventory.types';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [FormsModule, InventoryTableComponent, BulkActionBarComponent],
  template: `
    <div class="header">
      <h2>Inventory</h2>
      <span class="count">{{ total() }} products</span>
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
        placeholder="Search by title..."
        class="search-input"
      />
    </div>

    @if (selected().size > 0) {
      <app-bulk-action-bar
        [count]="selected().size"
        [busy]="bulkBusy()"
        (applied)="onBulkApply($event)"
        (clear)="selected.set(emptySet)"
      />
    }

    @if (feedback()) {
      <div class="feedback" [class]="feedback()!.type">{{ feedback()!.message }}</div>
    }

    @if (loading() && products().length === 0) {
      <div class="loading">Loading inventory...</div>
    } @else if (products().length === 0) {
      <div class="empty">No products match your filters.</div>
    } @else {
      <app-inventory-table
        [products]="products()"
        [selectable]="true"
        [selected]="selected()"
        [editQueryParams]="editQueryParams()"
        (selectionChange)="selected.set($event)"
      />

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
        color: var(--muted, #6b7280);
        font-size: 0.9rem;
      }
      .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .filters select {
        padding: 8px 12px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        font-size: 0.9rem;
        background: var(--card-bg, #fff);
      }
      .search-input {
        flex: 1;
        min-width: 200px;
        padding: 8px 12px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .feedback {
        padding: 10px 14px;
        border-radius: 6px;
        margin-bottom: 12px;
        font-size: 0.9rem;
      }
      .feedback.success {
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #bbf7d0;
      }
      .feedback.error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }
      .feedback.warning {
        background: #fffbeb;
        color: #d97706;
        border: 1px solid #fde68a;
      }
      .load-more {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
      .load-more button {
        padding: 10px 32px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        background: var(--card-bg, #fff);
        font-size: 0.95rem;
        cursor: pointer;
      }
      .load-more button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .loading,
      .empty {
        text-align: center;
        padding: 48px 16px;
        color: var(--muted, #6b7280);
      }
    `,
  ],
})
export class InventoryListComponent implements OnInit {
  readonly products = signal<InventoryProduct[]>([]);
  readonly categories = signal<string[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly selected = signal<Set<number>>(new Set<number>());
  readonly bulkBusy = signal(false);
  readonly feedback = signal<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  readonly hasMore = computed(() => this.products().length < this.total());

  readonly editQueryParams = computed<Record<string, string>>(() => {
    const params: Record<string, string> = {};
    if (this.selectedCategory) params['category'] = this.selectedCategory;
    if (this.searchQuery) params['search'] = this.searchQuery;
    return params;
  });

  readonly emptySet = new Set<number>();

  selectedCategory = '';
  searchQuery = '';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly limit = 50;

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
      .get<string[]>(`${API_BASE}/products/categories`)
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

  onBulkApply(event: { operation: BulkOperation; value: number }): void {
    const ids = Array.from(this.selected());
    if (ids.length === 0) return;

    this.bulkBusy.set(true);
    this.feedback.set(null);

    this.http
      .post<BulkAdjustResult>(`${API_BASE}/products/inventory/bulk`, {
        productIds: ids,
        operation: event.operation,
        value: event.value,
      })
      .subscribe({
        next: (result) => {
          const okCount = result.succeeded.length;
          const failCount = result.failed.length;

          if (failCount === 0) {
            this.feedback.set({
              type: 'success',
              message: `Updated stock for ${okCount} product${okCount === 1 ? '' : 's'}.`,
            });
          } else if (okCount === 0) {
            this.feedback.set({
              type: 'error',
              message: `All ${failCount} updates failed. First reason: ${result.failed[0].reason}`,
            });
          } else {
            this.feedback.set({
              type: 'warning',
              message: `Updated ${okCount}, failed ${failCount}. First failure: ${result.failed[0].reason}`,
            });
          }

          this.selected.set(new Set<number>());
          this.bulkBusy.set(false);
          this.loadProducts(true);
        },
        error: () => {
          this.feedback.set({ type: 'error', message: 'Bulk update failed.' });
          this.bulkBusy.set(false);
        },
      });
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

    let url = `${API_BASE}/products?skip=${skip}&limit=${this.limit}`;
    if (this.selectedCategory)
      url += `&category=${encodeURIComponent(this.selectedCategory)}`;
    if (this.searchQuery) url += `&search=${encodeURIComponent(this.searchQuery)}`;

    this.http.get<InventoryListResponse>(url).subscribe((res) => {
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
