import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <main class="shell">
      <nav class="nav">
        <h1>Workshop</h1>
        <ul>
          <li><a routerLink="/hello" routerLinkActive="active">Hello</a></li>
          <li><a routerLink="/todos" routerLinkActive="active">Todos</a></li>
          <li>
            <a routerLink="/notifications" routerLinkActive="active">Notifications</a>
          </li>
          <li><a routerLink="/reports" routerLinkActive="active">Reports</a></li>
          <li><a routerLink="/analytics" routerLinkActive="active">Analytics</a></li>
          <li><a routerLink="/products" routerLinkActive="active">Products</a></li>
        </ul>
      </nav>
      <section class="content">
        <router-outlet />
      </section>
    </main>
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
      }
      .nav h1 {
        font-size: 16px;
        margin: 0 0 16px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
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
    `,
  ],
})
export class AppComponent {}
