import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BulkOperation } from './inventory.types';

@Component({
  selector: 'app-bulk-action-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bar">
      <span class="count">{{ count() }} selected</span>

      <select [(ngModel)]="operation">
        <option value="set">Set stock to</option>
        <option value="add">Add to stock</option>
        <option value="subtract">Subtract from stock</option>
      </select>

      <input
        type="number"
        min="0"
        [(ngModel)]="value"
        placeholder="Value"
        class="value-input"
      />

      <button class="apply-btn" [disabled]="busy() || !canApply()" (click)="apply()">
        @if (busy()) {
          Applying...
        } @else {
          Apply
        }
      </button>

      <button class="cancel-btn" (click)="clear.emit()">Clear</button>
    </div>
  `,
  styles: [
    `
      .bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: var(--accent, #2563eb);
        color: #fff;
        border-radius: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .count {
        font-weight: 600;
      }
      select,
      .value-input {
        padding: 6px 10px;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      .value-input {
        width: 100px;
      }
      .apply-btn,
      .cancel-btn {
        padding: 6px 14px;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        font-weight: 500;
      }
      .apply-btn {
        background: #fff;
        color: var(--accent, #2563eb);
      }
      .apply-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cancel-btn {
        background: transparent;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
    `,
  ],
})
export class BulkActionBarComponent {
  readonly count = input.required<number>();
  readonly busy = input(false);

  readonly applied = output<{ operation: BulkOperation; value: number }>();
  readonly clear = output<void>();

  operation: BulkOperation = 'set';
  value: number | null = null;

  canApply(): boolean {
    return this.value !== null && !isNaN(Number(this.value)) && Number(this.value) >= 0;
  }

  apply(): void {
    if (!this.canApply()) return;
    this.applied.emit({ operation: this.operation, value: Number(this.value) });
  }
}
