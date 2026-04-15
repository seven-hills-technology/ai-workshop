import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../config';
import { AuthService } from '../auth/auth.service';
import {
  AddItemRequest,
  CartView,
  UpdateItemRequest,
} from './cart.types';

const EMPTY_CART: CartView = { items: [], expiresAt: null };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly _cart = signal<CartView>(EMPTY_CART);
  readonly cart = this._cart.asReadonly();

  private readonly _now = signal(Date.now());

  readonly itemCount = computed(() =>
    this._cart().items.reduce((n, i) => n + i.quantity, 0),
  );

  readonly isActive = computed(() => {
    const exp = this._cart().expiresAt;
    return exp !== null && new Date(exp).getTime() > this._now();
  });

  readonly secondsRemaining = computed(() => {
    const exp = this._cart().expiresAt;
    if (!exp) return 0;
    return Math.max(0, Math.floor((new Date(exp).getTime() - this._now()) / 1000));
  });

  readonly formattedTimeRemaining = computed(() => {
    const s = this.secondsRemaining();
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  });

  constructor() {
    setInterval(() => this._now.set(Date.now()), 1000);

    // On boot: if already logged in (restored from storage), pull the cart.
    if (this.authService.isLoggedIn()) {
      this.refresh().subscribe({ error: () => undefined });
    }

    // React to login/logout changes.
    let previouslyLoggedIn = this.authService.isLoggedIn();
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (loggedIn === previouslyLoggedIn) return;
      previouslyLoggedIn = loggedIn;
      if (loggedIn) {
        this.refresh().subscribe({ error: () => undefined });
      } else {
        this._cart.set(EMPTY_CART);
      }
    });
  }

  refresh(): Observable<CartView> {
    return this.http
      .get<CartView>(`${API_BASE}/cart`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  addItem(productId: number, quantity: number): Observable<CartView> {
    const body: AddItemRequest = { productId, quantity };
    return this.http
      .post<CartView>(`${API_BASE}/cart/items`, body)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  updateItem(productId: number, quantity: number): Observable<CartView> {
    const body: UpdateItemRequest = { quantity };
    return this.http
      .patch<CartView>(`${API_BASE}/cart/items/${productId}`, body)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  removeItem(productId: number): Observable<CartView> {
    return this.http
      .delete<CartView>(`${API_BASE}/cart/items/${productId}`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  clear(): Observable<CartView> {
    return this.http
      .delete<CartView>(`${API_BASE}/cart`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }
}
