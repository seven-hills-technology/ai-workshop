import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { CartService } from '../../core/cart/cart.service';
import { CartItemView } from '../../core/cart/cart.types';

@Component({
  selector: 'app-cart-line',
  standalone: true,
  template: `
    <div class="line">
      <img [src]="item().thumbnail" [alt]="item().title" class="thumb" />

      <div class="body">
        <div class="title" [title]="item().title">{{ item().title }}</div>
        <div class="price">\${{ item().price.toFixed(2) }}</div>

        <div class="qty-row">
          <button
            type="button"
            class="qty-btn"
            (click)="decrement()"
            [disabled]="busy() || item().quantity <= 1"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span class="qty-value">{{ item().quantity }}</span>
          <button
            type="button"
            class="qty-btn"
            (click)="increment()"
            [disabled]="busy() || item().quantity >= item().availableStock"
            aria-label="Increase quantity"
          >
            +
          </button>

          <button
            type="button"
            class="remove-btn"
            (click)="remove()"
            [disabled]="busy()"
            aria-label="Remove item"
          >
            ×
          </button>
        </div>

        @if (errorMessage()) {
          <div class="error">{{ errorMessage() }}</div>
        }
      </div>

      <div class="subtotal">
        \${{ (item().price * item().quantity).toFixed(2) }}
      </div>
    </div>
  `,
  styles: [
    `
      .line {
        display: grid;
        grid-template-columns: 56px 1fr auto;
        gap: 10px;
        padding: 12px 0;
        border-bottom: 1px solid var(--border, #e5e7eb);
        align-items: flex-start;
      }
      .thumb {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: 6px;
        background: #f5f5f5;
      }
      .body {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .title {
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.25;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .price {
        color: var(--muted, #6b7280);
        font-size: 0.85rem;
      }
      .qty-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .qty-btn,
      .remove-btn {
        width: 26px;
        height: 26px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 4px;
        background: var(--card-bg, #fff);
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        padding: 0;
      }
      .qty-btn:hover:not(:disabled),
      .remove-btn:hover:not(:disabled) {
        background: var(--badge-bg, #f3f4f6);
      }
      .qty-btn:disabled,
      .remove-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .qty-value {
        min-width: 22px;
        text-align: center;
        font-size: 0.9rem;
      }
      .remove-btn {
        margin-left: 6px;
        color: #dc2626;
        border-color: #fecaca;
      }
      .subtotal {
        font-weight: 600;
        font-size: 0.95rem;
        white-space: nowrap;
      }
      .error {
        color: #dc2626;
        font-size: 0.75rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        padding: 3px 6px;
        border-radius: 4px;
      }
    `,
  ],
})
export class CartLineComponent {
  private readonly cartService = inject(CartService);

  readonly item = input.required<CartItemView>();

  readonly busy = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  increment(): void {
    const current = this.item();
    this.busy.set(true);
    this.cartService
      .updateItem(current.productId, current.quantity + 1)
      .subscribe({
        next: () => this.busy.set(false),
        error: (err: unknown) => {
          this.busy.set(false);
          this.showError(this.extractMessage(err, current.availableStock));
        },
      });
  }

  decrement(): void {
    const current = this.item();
    if (current.quantity <= 1) return;
    this.busy.set(true);
    this.cartService
      .updateItem(current.productId, current.quantity - 1)
      .subscribe({
        next: () => this.busy.set(false),
        error: () => this.busy.set(false),
      });
  }

  remove(): void {
    const current = this.item();
    this.busy.set(true);
    this.cartService.removeItem(current.productId).subscribe({
      next: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => this.errorMessage.set(null), 3000);
  }

  private extractMessage(err: unknown, availableStock: number): string {
    if (err instanceof HttpErrorResponse && err.status === 409) {
      const body = err.error as { message?: string } | null;
      return body?.message ?? `Only ${availableStock} available`;
    }
    return 'Something went wrong. Please try again.';
  }
}
