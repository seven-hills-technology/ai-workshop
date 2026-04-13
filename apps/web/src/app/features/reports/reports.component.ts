import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

type ReportRow = { label: string; value: number };

@Component({
  selector: 'app-reports',
  standalone: true,
  template: `
    <h2>Reports</h2>
    <p>
      Workshop section 4. Make a change and run the
      <code>code-reviewer</code> agent on the diff.
    </p>

    @if (rows().length) {
      <table>
        <tbody>
          @for (row of rows(); track row.label) {
            <tr>
              <td>{{ row.label }}</td>
              <td class="value">{{ row.value }}</td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <p class="muted">loading…</p>
    }
  `,
  styles: [
    `
      table {
        border-collapse: collapse;
      }
      td {
        padding: 6px 16px 6px 0;
        border-bottom: 1px solid var(--border);
      }
      .value {
        color: var(--accent);
        font-variant-numeric: tabular-nums;
      }
      .muted {
        color: var(--muted);
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  readonly rows = signal<ReportRow[]>([]);

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<ReportRow[]>('http://localhost:3000/reports/summary')
      .subscribe((rows) => this.rows.set(rows));
  }
}
