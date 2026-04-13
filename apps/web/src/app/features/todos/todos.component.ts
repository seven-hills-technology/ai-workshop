import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Todo = {
  id: string;
  title: string;
  status: 'open' | 'done';
  createdAt: string;
};

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Todos</h2>
    <p>Workshop section 2. Minimal CRUD surface for the tool-calls exercise.</p>

    <form (submit)="add($event)" class="row">
      <input
        name="title"
        [(ngModel)]="draft"
        placeholder="new todo"
        required
      />
      <button type="submit" [disabled]="!draft.trim()">add</button>
    </form>

    @if (todos().length === 0) {
      <p class="muted">no todos yet.</p>
    } @else {
      <ul class="list">
        @for (todo of todos(); track todo.id) {
          <li [class.done]="todo.status === 'done'">
            <span>{{ todo.title }}</span>
            @if (todo.status === 'open') {
              <button (click)="complete(todo.id)">done</button>
            }
          </li>
        }
      </ul>
    }
  `,
  styles: [
    `
      .row {
        display: flex;
        gap: 8px;
        margin: 12px 0 16px;
      }
      .list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: 6px;
      }
      .list li.done span {
        text-decoration: line-through;
        color: var(--muted);
      }
      .muted {
        color: var(--muted);
      }
    `,
  ],
})
export class TodosComponent implements OnInit {
  readonly todos = signal<Todo[]>([]);
  draft = '';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  add(event: Event): void {
    event.preventDefault();
    const title = this.draft.trim();
    if (!title) return;
    this.http
      .post<Todo>('http://localhost:3000/todos', { title })
      .subscribe((todo) => {
        this.todos.update((list) => [...list, todo]);
        this.draft = '';
      });
  }

  complete(id: string): void {
    this.http
      .patch<Todo>(`http://localhost:3000/todos/${id}/complete`, {})
      .subscribe((updated) => {
        this.todos.update((list) =>
          list.map((t) => (t.id === updated.id ? updated : t)),
        );
      });
  }

  private load(): void {
    this.http
      .get<Todo[]>('http://localhost:3000/todos')
      .subscribe((list) => this.todos.set(list));
  }
}
