import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { API_BASE, InventoryProduct } from './inventory.types';

@Component({
  selector: 'app-inventory-edit',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (loading()) {
      <div class="loading">Loading product...</div>
    } @else if (notFound()) {
      <div class="not-found">
        <h2>Product Not Found</h2>
        <button (click)="goBack()">Back</button>
      </div>
    } @else if (product()) {
      <button class="back-btn" (click)="goBack()">&larr; Back to Inventory</button>

      <div class="card">
        <div class="product-header">
          <img [src]="product()!.thumbnail" [alt]="product()!.title" class="thumb" />
          <div>
            <h2>{{ product()!.title }}</h2>
            <span class="category">{{ product()!.category }}</span>
          </div>
        </div>

        <form (submit)="save($event)" class="form">
          <div class="field">
            <label for="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min="0"
              [(ngModel)]="stockInput"
              name="stock"
              required
            />
          </div>

          <div class="field">
            <label for="threshold">Low-Stock Threshold</label>
            <input
              id="threshold"
              type="number"
              min="0"
              [(ngModel)]="thresholdInput"
              name="threshold"
              required
            />
            <span class="hint">
              Products at or below this stock level are marked "Low Stock"
            </span>
          </div>

          <div class="preview">
            <strong>Availability preview:</strong>
            <span class="status" [class]="previewStatusClass()">
              {{ previewStatus() }}
            </span>
          </div>

          @if (errorMessage()) {
            <div class="error">{{ errorMessage() }}</div>
          }

          <div class="actions">
            <button type="submit" [disabled]="saving() || !isValid()" class="save-btn">
              @if (saving()) {
                Saving...
              } @else {
                Save
              }
            </button>
            <button type="button" (click)="goBack()" class="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 600px;
        margin: 0 auto;
        padding: 0 16px;
      }
      .loading,
      .not-found {
        text-align: center;
        padding: 48px 16px;
        color: var(--muted, #6b7280);
      }
      .back-btn {
        background: none;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        padding: 6px 12px;
        cursor: pointer;
        margin-bottom: 16px;
        font-size: 0.9rem;
      }
      .card {
        background: var(--card-bg, #fff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 10px;
        padding: 24px;
      }
      .product-header {
        display: flex;
        gap: 16px;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border, #e5e7eb);
        margin-bottom: 20px;
      }
      .thumb {
        width: 72px;
        height: 72px;
        object-fit: cover;
        border-radius: 6px;
      }
      .product-header h2 {
        margin: 0 0 4px;
        font-size: 1.2rem;
      }
      .category {
        font-size: 0.8rem;
        color: var(--muted, #6b7280);
        background: var(--badge-bg, #f3f4f6);
        padding: 2px 8px;
        border-radius: 4px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .field label {
        font-weight: 600;
        font-size: 0.9rem;
      }
      .field input {
        padding: 8px 12px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        font-size: 1rem;
      }
      .hint {
        font-size: 0.8rem;
        color: var(--muted, #6b7280);
      }
      .preview {
        padding: 12px;
        background: var(--badge-bg, #f3f4f6);
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
      }
      .status {
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 4px;
      }
      .status.in-stock {
        color: #16a34a;
        background: #f0fdf4;
      }
      .status.low-stock {
        color: #d97706;
        background: #fffbeb;
      }
      .status.out-of-stock {
        color: #dc2626;
        background: #fef2f2;
      }
      .error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .actions {
        display: flex;
        gap: 10px;
        margin-top: 8px;
      }
      .save-btn,
      .cancel-btn {
        padding: 8px 20px;
        border-radius: 6px;
        font-size: 0.95rem;
        cursor: pointer;
        border: 1px solid var(--border, #e5e7eb);
      }
      .save-btn {
        background: var(--accent, #2563eb);
        color: #fff;
        border-color: var(--accent, #2563eb);
      }
      .save-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cancel-btn {
        background: var(--card-bg, #fff);
      }
    `,
  ],
})
export class InventoryEditComponent implements OnInit {
  readonly id = input.required<string>();

  readonly product = signal<InventoryProduct | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  stockInput: number | null = null;
  thresholdInput: number | null = null;

  readonly previewStatus = computed(() => {
    const s = Number(this.stockInput);
    const t = Number(this.thresholdInput);
    if (!Number.isFinite(s) || !Number.isFinite(t)) return 'In Stock';
    if (s === 0) return 'Out of Stock';
    if (s <= t) return 'Low Stock';
    return 'In Stock';
  });

  readonly previewStatusClass = computed(() => {
    const status = this.previewStatus();
    if (status === 'Out of Stock') return 'out-of-stock';
    if (status === 'Low Stock') return 'low-stock';
    return 'in-stock';
  });

  constructor(
    private readonly http: HttpClient,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    this.http.get<InventoryProduct>(`${API_BASE}/products/${this.id()}`).subscribe({
      next: (product) => {
        this.product.set(product);
        this.stockInput = product.stock;
        this.thresholdInput = product.lowStockThreshold;
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  isValid(): boolean {
    return (
      this.stockInput !== null &&
      this.thresholdInput !== null &&
      Number(this.stockInput) >= 0 &&
      Number(this.thresholdInput) >= 0
    );
  }

  save(event: Event): void {
    event.preventDefault();
    if (!this.isValid()) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.http
      .patch<InventoryProduct>(`${API_BASE}/products/${this.id()}/inventory`, {
        stock: Number(this.stockInput),
        lowStockThreshold: Number(this.thresholdInput),
      })
      .subscribe({
        next: (updated) => {
          this.product.set(updated);
          this.saving.set(false);
          this.goBack();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message ?? 'Save failed');
          this.saving.set(false);
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
