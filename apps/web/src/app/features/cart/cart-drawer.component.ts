import { Component, computed, inject, signal } from '@angular/core';
import { CartDrawerService } from '../../core/cart/cart-drawer.service';
import { CartService } from '../../core/cart/cart.service';
import { CartLineComponent } from './cart-line.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CartLineComponent],
  template: `
    @if (drawerService.isOpen()) {
      <div class="backdrop" (click)="drawerService.close()"></div>
    }

    <aside class="drawer" [class.open]="drawerService.isOpen()" aria-label="Shopping cart">
      <header class="drawer-header">
        <div class="title-row">
          <h2>Your cart</h2>
          @if (cartService.isActive()) {
            <span class="countdown" title="Time until reservation expires">
              Expires in {{ cartService.formattedTimeRemaining() }}
            </span>
          }
        </div>
        <button type="button" class="close-btn" (click)="drawerService.close()" aria-label="Close cart">
          ×
        </button>
      </header>

      @if (cartService.cart().justExpired) {
        <div class="expired-banner">
          Your cart expired and was cleared.
        </div>
      }

      <div class="drawer-body">
        @if (cartService.cart().items.length === 0) {
          <div class="empty">Your cart is empty. Add items from the catalog.</div>
        } @else {
          @for (item of cartService.cart().items; track item.productId) {
            <app-cart-line [item]="item" />
          }
        }
      </div>

      @if (cartService.cart().items.length > 0) {
        <footer class="drawer-footer">
          <div class="total-row">
            <span>Total</span>
            <strong>\${{ total().toFixed(2) }}</strong>
          </div>
          <button
            type="button"
            class="clear-btn"
            (click)="onClear()"
            [disabled]="clearing()"
          >
            @if (clearing()) {
              Clearing…
            } @else {
              Clear cart
            }
          </button>
        </footer>
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 9;
      }
      .drawer {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 360px;
        max-width: 90vw;
        background: var(--card-bg, #fff);
        border-left: 1px solid var(--border, #e5e7eb);
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08);
        z-index: 10;
        transform: translateX(100%);
        transition: transform 0.25s ease-in-out;
        display: flex;
        flex-direction: column;
      }
      .drawer.open {
        transform: translateX(0);
      }
      .drawer-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 16px 16px 12px;
        border-bottom: 1px solid var(--border, #e5e7eb);
        gap: 10px;
      }
      .title-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .drawer-header h2 {
        margin: 0;
        font-size: 1.05rem;
      }
      .countdown {
        font-size: 0.8rem;
        color: var(--muted, #6b7280);
        font-variant-numeric: tabular-nums;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.6rem;
        line-height: 1;
        cursor: pointer;
        color: var(--muted, #6b7280);
        padding: 0 4px;
      }
      .close-btn:hover {
        color: var(--fg, #111);
      }
      .expired-banner {
        background: #fffbeb;
        color: #92400e;
        border-bottom: 1px solid #fde68a;
        padding: 10px 16px;
        font-size: 0.85rem;
      }
      .drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 0 16px;
      }
      .empty {
        padding: 32px 8px;
        text-align: center;
        color: var(--muted, #6b7280);
        font-size: 0.9rem;
      }
      .drawer-footer {
        padding: 12px 16px 16px;
        border-top: 1px solid var(--border, #e5e7eb);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 1rem;
      }
      .total-row strong {
        font-size: 1.1rem;
      }
      .clear-btn {
        padding: 8px 12px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        background: var(--card-bg, #fff);
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--muted, #6b7280);
      }
      .clear-btn:hover:not(:disabled) {
        background: var(--badge-bg, #f3f4f6);
        color: var(--fg, #111);
      }
      .clear-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  readonly drawerService = inject(CartDrawerService);

  readonly clearing = signal(false);

  readonly total = computed(() =>
    this.cartService
      .cart()
      .items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  onClear(): void {
    if (this.clearing()) return;
    this.clearing.set(true);
    this.cartService.clear().subscribe({
      next: () => this.clearing.set(false),
      error: () => this.clearing.set(false),
    });
  }
}
