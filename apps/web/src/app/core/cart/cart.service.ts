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

  // Bumped on every successful add/update/remove/clear (NOT on refresh).
  // Components that display product availability can effect() on this to
  // re-fetch when the cart mutates without coupling to a specific event bus.
  private readonly _mutationVersion = signal(0);
  readonly mutationVersion = this._mutationVersion.asReadonly();

  // Set when the per-cart timer ticks past the expiry while the user has
  // items in the cart. The expired-modal component watches this and shows
  // a notice; calling dismissExpiryNotice() clears it.
  private readonly _expiredAt = signal<Date | null>(null);
  readonly expiredAt = this._expiredAt.asReadonly();

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

  // Deterministic timer keyed off the current cart's expiresAt. We re-arm it
  // every time the cart changes (mutation, refresh, login). Using setTimeout
  // (vs. a per-second effect tick) avoids relying on signal-effect scheduling
  // and fires precisely at the wall-clock expiry moment.
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Drives the drawer's mm:ss countdown display only.
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
        this.cancelExpiryTimer();
        this._cart.set(EMPTY_CART);
        this._expiredAt.set(null);
      }
    });
  }

  dismissExpiryNotice(): void {
    this._expiredAt.set(null);
  }

  refresh(): Observable<CartView> {
    return this.http
      .get<CartView>(`${API_BASE}/cart`)
      .pipe(tap((cart) => this.setCart(cart)));
  }

  addItem(productId: number, quantity: number): Observable<CartView> {
    const body: AddItemRequest = { productId, quantity };
    return this.http
      .post<CartView>(`${API_BASE}/cart/items`, body)
      .pipe(tap((cart) => this.applyMutation(cart)));
  }

  updateItem(productId: number, quantity: number): Observable<CartView> {
    const body: UpdateItemRequest = { quantity };
    return this.http
      .patch<CartView>(`${API_BASE}/cart/items/${productId}`, body)
      .pipe(tap((cart) => this.applyMutation(cart)));
  }

  removeItem(productId: number): Observable<CartView> {
    return this.http
      .delete<CartView>(`${API_BASE}/cart/items/${productId}`)
      .pipe(tap((cart) => this.applyMutation(cart)));
  }

  clear(): Observable<CartView> {
    return this.http
      .delete<CartView>(`${API_BASE}/cart`)
      .pipe(tap((cart) => this.applyMutation(cart)));
  }

  private setCart(cart: CartView): void {
    this._cart.set(cart);
    this.scheduleExpiry();
  }

  private applyMutation(cart: CartView): void {
    this.setCart(cart);
    this._mutationVersion.update((v) => v + 1);
  }

  // (Re)arm the expiry timer based on the current cart's expiresAt. Idempotent
  // — call it whenever the cart changes. Cancels any existing timer first.
  private scheduleExpiry(): void {
    this.cancelExpiryTimer();
    const exp = this._cart().expiresAt;
    if (!exp) return;
    const delay = new Date(exp).getTime() - Date.now();
    if (delay <= 0) {
      // Already past the deadline (server clock ahead, or user came back from
      // a backgrounded tab and Date.now() jumped past the saved expiresAt).
      this.handleLocalExpiry();
      return;
    }
    this.expiryTimer = setTimeout(() => {
      this.expiryTimer = null;
      this.handleLocalExpiry();
    }, delay);
  }

  private cancelExpiryTimer(): void {
    if (this.expiryTimer !== null) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private handleLocalExpiry(): void {
    const current = this._cart();
    if (!current.expiresAt) return;
    const expiredAt = new Date(current.expiresAt);
    this._cart.set(EMPTY_CART);
    this._mutationVersion.update((v) => v + 1);
    this._expiredAt.set(expiredAt);
    // Best-effort sync with the server so its lazy cleanup runs and any
    // subsequent add starts a fresh reservation window cleanly.
    this.refresh().subscribe({ error: () => undefined });
  }
}
