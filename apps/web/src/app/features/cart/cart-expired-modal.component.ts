import { Component, inject } from '@angular/core';
import { CartService } from '../../core/cart/cart.service';

@Component({
  selector: 'app-cart-expired-modal',
  standalone: true,
  template: `
    @if (cartService.expiredAt()) {
      <div
        class="backdrop"
        (click)="dismiss()"
        role="presentation"
      ></div>
      <div
        class="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cart-expired-title"
        aria-describedby="cart-expired-body"
      >
        <h2 id="cart-expired-title" class="title">Your cart expired</h2>
        <p id="cart-expired-body" class="body">
          Your 2-minute reservation has ended. The items in your cart have
          been released back to inventory and your cart is now empty.
        </p>
        <button
          type="button"
          class="ok"
          autofocus
          (click)="dismiss()"
        >
          OK
        </button>
      </div>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 100;
        pointer-events: none;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        pointer-events: auto;
        animation: fade-in 0.15s ease-out;
      }
      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg, #fff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 10px;
        padding: 24px;
        width: min(420px, calc(100vw - 32px));
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
        pointer-events: auto;
        animation: pop-in 0.18s ease-out;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .title {
        margin: 0;
        font-size: 1.15rem;
        color: var(--fg, #111);
      }
      .body {
        margin: 0;
        line-height: 1.5;
        color: var(--fg, #333);
      }
      .ok {
        align-self: flex-end;
        margin-top: 4px;
        padding: 8px 18px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        background: var(--accent, #2563eb);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
      }
      .ok:hover {
        filter: brightness(1.05);
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pop-in {
        from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    `,
  ],
})
export class CartExpiredModalComponent {
  readonly cartService = inject(CartService);

  dismiss(): void {
    this.cartService.dismissExpiryNotice();
  }
}
