import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

type Product = {
  id: number;
  title: string;
  price: number;
  discountPercentage: number;
  category: string;
  thumbnail: string;
  rating: number;
};

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/products', product().id]" class="card">
      <img [src]="product().thumbnail" [alt]="product().title" class="thumbnail" />
      <div class="body">
        <span class="category">{{ product().category }}</span>
        <h3 class="title">{{ product().title }}</h3>
        <div class="rating">
          <span class="stars">{{ getStars(product().rating) }}</span>
          <span class="rating-value">{{ product().rating.toFixed(1) }}</span>
        </div>
        <div class="price-row">
          @if (product().discountPercentage > 0) {
            <span class="price-original">\${{ product().price.toFixed(2) }}</span>
            <span class="price-discounted">\${{ getDiscountedPrice().toFixed(2) }}</span>
          } @else {
            <span class="price">\${{ product().price.toFixed(2) }}</span>
          }
        </div>
      </div>
    </a>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 10px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.2s, transform 0.2s;
        background: var(--card-bg, #fff);
      }
      .card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      .thumbnail {
        width: 100%;
        height: 200px;
        object-fit: cover;
        background: #f5f5f5;
      }
      .body {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
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
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.85rem;
      }
      .stars {
        color: #f59e0b;
      }
      .rating-value {
        color: var(--muted, #888);
      }
      .price-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }
      .price,
      .price-discounted {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text, #111);
      }
      .price-original {
        font-size: 0.9rem;
        text-decoration: line-through;
        color: var(--muted, #888);
      }
    `,
  ],
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  getDiscountedPrice(): number {
    const p = this.product();
    return p.price * (1 - p.discountPercentage / 100);
  }
}
