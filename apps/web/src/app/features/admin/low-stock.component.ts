import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { InventoryTableComponent } from './inventory-table.component';
import { API_BASE } from '../../core/config';
import {
  InventoryListResponse,
  InventoryProduct,
} from './inventory.types';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [InventoryTableComponent],
  template: `
    <div class="header">
      <h2>Low Stock</h2>
      <span class="count">{{ total() }} product{{ total() === 1 ? '' : 's' }} need attention</span>
    </div>

    @if (loading()) {
      <div class="loading">Loading low-stock items...</div>
    } @else if (products().length === 0) {
      <div class="empty">
        <h3>All stocked up! 🎉</h3>
        <p>No products are at or below their low-stock threshold.</p>
      </div>
    } @else {
      <app-inventory-table [products]="products()" />
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
        margin-bottom: 20px;
      }
      .header h2 {
        margin: 0;
      }
      .count {
        color: var(--muted, #6b7280);
        font-size: 0.9rem;
      }
      .loading {
        text-align: center;
        padding: 48px 16px;
        color: var(--muted, #6b7280);
      }
      .empty {
        text-align: center;
        padding: 64px 16px;
        color: var(--muted, #6b7280);
      }
      .empty h3 {
        margin: 0 0 8px;
        color: var(--fg, #1a1a1a);
      }
    `,
  ],
})
export class LowStockComponent implements OnInit {
  readonly products = signal<InventoryProduct[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<InventoryListResponse>(`${API_BASE}/products?lowStock=true&limit=100`)
      .subscribe((res) => {
        this.products.set(res.products);
        this.total.set(res.total);
        this.loading.set(false);
      });
  }
}
