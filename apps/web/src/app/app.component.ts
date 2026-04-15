import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { CartService } from './core/cart/cart.service';
import { CartDrawerService } from './core/cart/cart-drawer.service';
import { CartDrawerComponent } from './features/cart/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CartDrawerComponent],
  template: `
    @if (authService.isLoggedIn()) {
      <main class="shell">
        <nav class="nav">
          <h1>Workshop</h1>

          <div class="user-block">
            <div class="user-email" title="{{ authService.user()?.email }}">
              {{ authService.user()?.email }}
            </div>
            <div class="user-actions">
              <button type="button" class="logout" (click)="onLogout()">Logout</button>
              <button
                type="button"
                class="cart-btn"
                (click)="cartDrawerService.toggle()"
                aria-label="Open cart"
              >
                Cart
                @if (cartService.itemCount() > 0) {
                  <span class="cart-badge">{{ cartService.itemCount() }}</span>
                }
              </button>
            </div>
          </div>

          <ul>
            <li><a routerLink="/products" routerLinkActive="active">Products</a></li>
          </ul>

          @if (authService.isAdmin()) {
            <h1 class="section-label">Admin</h1>
            <ul>
              <li>
                <a routerLink="/admin/inventory" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inventory</a>
              </li>
              <li>
                <a routerLink="/admin/inventory/low-stock" routerLinkActive="active">Low Stock</a>
              </li>
            </ul>
          }
        </nav>
        <section class="content">
          <router-outlet />
        </section>
      </main>

      <app-cart-drawer />
    } @else {
      <router-outlet />
    }
  `,
  styles: [
    `
      .shell {
        display: grid;
        grid-template-columns: 220px 1fr;
        min-height: 100vh;
      }
      .nav {
        border-right: 1px solid var(--border);
        padding: 20px;
        box-sizing: border-box;
      }
      .nav h1 {
        font-size: 16px;
        margin: 0 0 16px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .nav h1.section-label {
        margin-top: 20px;
      }
      .nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav a {
        display: block;
        padding: 6px 10px;
        border-radius: 6px;
        color: var(--fg);
      }
      .nav a.active {
        background: var(--border);
        color: var(--accent);
      }
      .content {
        padding: 24px 32px;
      }
      .user-block {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .user-email {
        font-size: 12px;
        color: var(--muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .user-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .logout {
        font-size: 13px;
        padding: 4px 10px;
      }
      .cart-btn {
        font-size: 13px;
        padding: 4px 10px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--card-bg, #fff);
        border: 1px solid var(--border);
        border-radius: 6px;
        cursor: pointer;
        color: var(--fg);
      }
      .cart-btn:hover {
        background: var(--badge-bg, #f3f4f6);
      }
      .cart-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9px;
        background: var(--accent, #2563eb);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
      }
    `,
  ],
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly cartDrawerService = inject(CartDrawerService);
  private readonly router = inject(Router);

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
