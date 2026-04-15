import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryProduct } from './inventory.types';

type SortColumn =
  | 'title'
  | 'category'
  | 'stock'
  | 'reservedStock'
  | 'availableStock'
  | 'lowStockThreshold';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [RouterLink],
  template: `
    <table class="table">
      <thead>
        <tr>
          @if (selectable()) {
            <th class="check-col">
              <input
                type="checkbox"
                [checked]="allSelected()"
                (change)="toggleAll()"
              />
            </th>
          }
          <th class="thumb-col"></th>
          <th (click)="sort('title')" class="sortable">
            Title {{ sortArrow('title') }}
          </th>
          <th (click)="sort('category')" class="sortable">
            Category {{ sortArrow('category') }}
          </th>
          <th (click)="sort('stock')" class="sortable num">
            Stock {{ sortArrow('stock') }}
          </th>
          <th (click)="sort('reservedStock')" class="sortable num">
            Reserved {{ sortArrow('reservedStock') }}
          </th>
          <th (click)="sort('availableStock')" class="sortable num">
            Available {{ sortArrow('availableStock') }}
          </th>
          <th (click)="sort('lowStockThreshold')" class="sortable num">
            Threshold {{ sortArrow('lowStockThreshold') }}
          </th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        @for (p of sorted(); track p.id) {
          <tr [class]="rowClass(p)">
            @if (selectable()) {
              <td class="check-col">
                <input
                  type="checkbox"
                  [checked]="isSelected(p.id)"
                  (change)="toggleOne(p.id)"
                />
              </td>
            }
            <td class="thumb-col">
              <img [src]="p.thumbnail" [alt]="p.title" class="thumb" />
            </td>
            <td>{{ p.title }}</td>
            <td>{{ p.category }}</td>
            <td class="num">{{ p.stock }}</td>
            <td class="num">{{ p.reservedStock }}</td>
            <td class="num">{{ p.availableStock }}</td>
            <td class="num">{{ p.lowStockThreshold }}</td>
            <td>
              <span class="status" [class]="statusClass(p)">
                {{ p.availabilityStatus }}
              </span>
            </td>
            <td>
              <a
                [routerLink]="['/admin/inventory', p.id]"
                [queryParams]="editQueryParams"
                class="edit-link"
                >Edit</a
              >
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [
    `
      .table {
        width: 100%;
        border-collapse: collapse;
        background: var(--card-bg, #fff);
      }
      th,
      td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--border, #e5e7eb);
        font-size: 0.9rem;
      }
      th {
        background: var(--badge-bg, #f3f4f6);
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted, #6b7280);
      }
      th.sortable {
        cursor: pointer;
        user-select: none;
      }
      th.sortable:hover {
        background: #e5e7eb;
      }
      .num {
        text-align: right;
      }
      .check-col {
        width: 36px;
      }
      .thumb-col {
        width: 56px;
      }
      .thumb {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
      }
      tr.low-stock {
        background: #fffbeb;
      }
      tr.out-of-stock {
        background: #fef2f2;
      }
      .status {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 4px;
        display: inline-block;
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
      .edit-link {
        color: var(--accent, #2563eb);
        text-decoration: none;
        font-weight: 500;
      }
      .edit-link:hover {
        text-decoration: underline;
      }
      input[type='checkbox'] {
        cursor: pointer;
      }
    `,
  ],
})
export class InventoryTableComponent {
  readonly products = input.required<InventoryProduct[]>();
  readonly selectable = input(false);
  readonly selected = input<Set<number>>(new Set<number>());
  readonly editQueryParams = input<Record<string, string>>({});

  readonly selectionChange = output<Set<number>>();

  private readonly sortState = { column: null as SortColumn | null, direction: 'asc' as SortDirection };

  readonly sorted = computed(() => {
    const list = [...this.products()];
    if (!this.sortState.column) return list;
    const col = this.sortState.column;
    const dir = this.sortState.direction === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  });

  readonly allSelected = computed(
    () =>
      this.products().length > 0 &&
      this.products().every((p) => this.selected().has(p.id)),
  );

  sort(column: SortColumn): void {
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }
  }

  sortArrow(column: SortColumn): string {
    if (this.sortState.column !== column) return '';
    return this.sortState.direction === 'asc' ? '↑' : '↓';
  }

  rowClass(p: InventoryProduct): string {
    if (p.availabilityStatus === 'Out of Stock') return 'out-of-stock';
    if (p.availabilityStatus === 'Low Stock') return 'low-stock';
    return '';
  }

  statusClass(p: InventoryProduct): string {
    if (p.availabilityStatus === 'Out of Stock') return 'out-of-stock';
    if (p.availabilityStatus === 'Low Stock') return 'low-stock';
    return 'in-stock';
  }

  isSelected(id: number): boolean {
    return this.selected().has(id);
  }

  toggleOne(id: number): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectionChange.emit(next);
  }

  toggleAll(): void {
    const all = this.products().map((p) => p.id);
    const next = this.allSelected() ? new Set<number>() : new Set(all);
    this.selectionChange.emit(next);
  }
}
