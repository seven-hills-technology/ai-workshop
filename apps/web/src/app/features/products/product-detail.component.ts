import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, signal, computed, effect, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartDrawerService } from '../../core/cart/cart-drawer.service';
import { CartService } from '../../core/cart/cart.service';

type Review = {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerEmail: string;
  date: string;
};

type ProductImage = {
  id: number;
  url: string;
};

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: string;
  brand: string;
  sku: string;
  thumbnail: string;
  rating: number;
  stock: number;
  availabilityStatus: string;
  availableStock: number;
  reservedStock: number;
  tags: string[];
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  reviews: Review[];
  images: ProductImage[];
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (loading()) {
      <div class="loading">Loading product...</div>
    } @else if (notFound()) {
      <div class="not-found">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button (click)="goBack()">Back to Products</button>
      </div>
    } @else if (product()) {
      <button class="back-btn" (click)="goBack()">&larr; Back to Products</button>

      <div class="detail-layout">
        <div class="gallery">
          <img [src]="selectedImage()" [alt]="product()!.title" class="main-image" />
          @if (product()!.images.length > 1) {
            <div class="thumbs">
              <img
                [src]="product()!.thumbnail"
                [alt]="product()!.title"
                class="thumb"
                [class.active]="selectedImage() === product()!.thumbnail"
                (click)="selectedImage.set(product()!.thumbnail)"
              />
              @for (img of product()!.images; track img.id) {
                <img
                  [src]="img.url"
                  [alt]="product()!.title"
                  class="thumb"
                  [class.active]="selectedImage() === img.url"
                  (click)="selectedImage.set(img.url)"
                />
              }
            </div>
          }
        </div>

        <div class="info">
          <span class="category">{{ product()!.category }}</span>
          <h1 class="title">{{ product()!.title }}</h1>
          <span class="brand">{{ product()!.brand }}</span>

          <div class="rating">
            <span class="stars">{{ getStars(product()!.rating) }}</span>
            <span>{{ product()!.rating.toFixed(1) }}</span>
            <span class="review-count">({{ product()!.reviews.length }} reviews)</span>
          </div>

          <div class="price-section">
            @if (product()!.discountPercentage > 0) {
              <span class="price-original">\${{ product()!.price.toFixed(2) }}</span>
              <span class="price-discounted">\${{ discountedPrice().toFixed(2) }}</span>
              <span class="discount-badge">-{{ product()!.discountPercentage.toFixed(0) }}%</span>
            } @else {
              <span class="price">\${{ product()!.price.toFixed(2) }}</span>
            }
          </div>

          <div class="stock" [class]="stockClass()">
            {{ stockLabel() }}
          </div>

          <div class="add-to-cart">
            <label class="qty-label" for="qty-input">Quantity</label>
            <div class="add-controls">
              <input
                id="qty-input"
                type="number"
                min="1"
                [max]="maxQty()"
                [ngModel]="quantity()"
                (ngModelChange)="onQuantityChange($event)"
                [disabled]="maxQty() === 0"
                class="qty-input"
              />
              <button
                type="button"
                class="add-btn"
                (click)="onAdd()"
                [disabled]="addDisabled()"
              >
                @if (maxQty() === 0) {
                  Out of stock
                } @else if (adding()) {
                  Adding…
                } @else {
                  Add {{ quantity() }} to cart
                }
              </button>
            </div>
            @if (errorMessage()) {
              <div class="add-error">{{ errorMessage() }}</div>
            }
          </div>

          <p class="description">{{ product()!.description }}</p>

          <div class="meta">
            <div class="meta-item">
              <strong>SKU:</strong> {{ product()!.sku }}
            </div>
            <div class="meta-item">
              <strong>Shipping:</strong> {{ product()!.shippingInformation }}
            </div>
            <div class="meta-item">
              <strong>Warranty:</strong> {{ product()!.warrantyInformation }}
            </div>
            <div class="meta-item">
              <strong>Returns:</strong> {{ product()!.returnPolicy }}
            </div>
          </div>

          @if (product()!.tags.length > 0) {
            <div class="tags">
              @for (tag of product()!.tags; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>
          }
        </div>
      </div>

      @if (product()!.reviews.length > 0) {
        <div class="reviews-section">
          <h2>Reviews ({{ product()!.reviews.length }})</h2>
          <div class="reviews-list">
            @for (review of product()!.reviews; track review.id) {
              <div class="review">
                <div class="review-header">
                  <strong>{{ review.reviewerName }}</strong>
                  <span class="review-stars">{{ getStars(review.rating) }}</span>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
              </div>
            }
          </div>
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
      .loading,
      .not-found {
        text-align: center;
        padding: 48px 16px;
        color: var(--muted, #888);
      }
      .not-found button,
      .back-btn {
        background: none;
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 6px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 0.9rem;
        margin-bottom: 20px;
        transition: background 0.15s;
      }
      .back-btn:hover,
      .not-found button:hover {
        background: var(--badge-bg, #f0f0f0);
      }
      .detail-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        margin-bottom: 32px;
      }
      @media (max-width: 768px) {
        .detail-layout {
          grid-template-columns: 1fr;
        }
      }
      .gallery {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .main-image {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: 10px;
        background: #f5f5f5;
      }
      .thumbs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
      }
      .thumb {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 6px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color 0.15s;
      }
      .thumb.active,
      .thumb:hover {
        border-color: var(--text, #111);
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .category {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted, #888);
        background: var(--badge-bg, #f0f0f0);
        padding: 2px 8px;
        border-radius: 4px;
        width: fit-content;
      }
      .title {
        font-size: 1.6rem;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
      }
      .brand {
        color: var(--muted, #888);
        font-size: 0.95rem;
      }
      .rating {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.95rem;
      }
      .stars {
        color: #f59e0b;
      }
      .review-count {
        color: var(--muted, #888);
      }
      .price-section {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 4px 0;
      }
      .price,
      .price-discounted {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .price-original {
        font-size: 1.1rem;
        text-decoration: line-through;
        color: var(--muted, #888);
      }
      .discount-badge {
        background: #ef4444;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .stock {
        font-size: 0.9rem;
        font-weight: 600;
        width: fit-content;
        padding: 4px 10px;
        border-radius: 4px;
      }
      .stock.in-stock {
        color: #16a34a;
        background: #f0fdf4;
      }
      .stock.low-stock {
        color: #d97706;
        background: #fffbeb;
      }
      .stock.out-of-stock {
        color: #dc2626;
        background: #fef2f2;
      }
      .add-to-cart {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 8px 0 4px;
      }
      .qty-label {
        font-size: 0.8rem;
        color: var(--muted, #6b7280);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .add-controls {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }
      .qty-input {
        width: 80px;
        padding: 8px 10px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .add-btn {
        flex: 1;
        padding: 8px 16px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        background: var(--accent, #2563eb);
        color: #fff;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
      }
      .add-btn:hover:not(:disabled) {
        filter: brightness(1.05);
      }
      .add-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        background: var(--muted, #6b7280);
      }
      .add-error {
        color: #dc2626;
        font-size: 0.8rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .description {
        line-height: 1.6;
        color: var(--text, #333);
        margin: 8px 0;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.9rem;
      }
      .meta-item strong {
        margin-right: 4px;
      }
      .tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .tag {
        background: var(--badge-bg, #f0f0f0);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: var(--muted, #666);
      }
      .reviews-section {
        border-top: 1px solid var(--border, #e0e0e0);
        padding-top: 24px;
        margin-bottom: 32px;
      }
      .reviews-section h2 {
        margin: 0 0 16px;
      }
      .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .review {
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 8px;
        padding: 14px;
      }
      .review-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .review-stars {
        color: #f59e0b;
        font-size: 0.9rem;
      }
      .review-date {
        color: var(--muted, #888);
        font-size: 0.8rem;
        margin-left: auto;
      }
      .review-comment {
        margin: 0;
        line-height: 1.5;
        color: var(--text, #333);
      }
    `,
  ],
})
export class ProductDetailComponent {
  readonly id = input.required<string>();

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly selectedImage = signal('');

  readonly discountedPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.price * (1 - p.discountPercentage / 100);
  });

  readonly stockLabel = computed(() => {
    const p = this.product();
    if (!p) return '';
    if (p.availableStock === 0) return 'Out of Stock';
    if (p.availabilityStatus === 'Low Stock') {
      return `Low Stock (${p.availableStock} available)`;
    }
    return `In Stock (${p.availableStock} available)`;
  });

  readonly stockClass = computed(() => {
    const p = this.product();
    if (!p) return '';
    if (p.availableStock === 0) return 'out-of-stock';
    if (p.availabilityStatus === 'Low Stock') return 'low-stock';
    return 'in-stock';
  });

  readonly quantity = signal(1);
  readonly adding = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly maxQty = computed(() => this.product()?.availableStock ?? 0);

  readonly addDisabled = computed(
    () => this.adding() || this.maxQty() === 0 || this.quantity() < 1,
  );

  private readonly cartService = inject(CartService);
  private readonly cartDrawerService = inject(CartDrawerService);
  private errorTimer: ReturnType<typeof setTimeout> | null = null;
  private hasLoaded = false;

  constructor(
    private readonly http: HttpClient,
    private readonly location: Location,
  ) {
    // Re-fetch the product whenever the id changes OR a cart mutation
    // happens, so the displayed availableStock / stock label stays in sync
    // with the user's own cart adds/removes without a page refresh.
    effect(() => {
      const id = this.id();
      this.cartService.mutationVersion();
      this.loadProduct(id);
    });
  }

  private loadProduct(id: string): void {
    this.http
      .get<Product>(`http://localhost:7800/products/${id}`)
      .subscribe({
        next: (product) => {
          this.product.set(product);
          if (!this.hasLoaded) {
            // Initial load: seed the gallery selection and a sane default qty.
            // On subsequent refreshes (cart mutations), preserve user state.
            this.selectedImage.set(product.thumbnail);
            this.quantity.set(product.availableStock > 0 ? 1 : 0);
            this.hasLoaded = true;
          } else {
            // Cap quantity to the new max so the +button stays correct.
            const max = product.availableStock;
            if (this.quantity() > max) {
              this.quantity.set(Math.max(1, max));
            }
          }
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
  }

  goBack(): void {
    this.location.back();
  }

  onQuantityChange(value: number | string | null): void {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const max = this.maxQty();
    const clamped = Math.max(1, Math.min(Math.floor(n), Math.max(1, max)));
    this.quantity.set(clamped);
  }

  onAdd(): void {
    const p = this.product();
    if (!p || this.adding() || this.maxQty() === 0) return;
    const qty = this.quantity();
    if (qty < 1) return;

    this.adding.set(true);
    this.cartService.addItem(p.id, qty).subscribe({
      next: () => {
        this.adding.set(false);
        this.cartDrawerService.open();
      },
      error: (err: unknown) => {
        this.adding.set(false);
        this.showError(this.extractMessage(err, p.availableStock));
      },
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
    return 'Unable to add to cart. Please try again.';
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
