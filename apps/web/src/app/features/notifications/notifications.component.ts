import { Component } from '@angular/core';

/**
 * Workshop section 3 exercise.
 *
 * This component is an intentional stub. Build it out to consume the
 * /notifications endpoints described in docs/specs/notifications.md — once
 * you've built the NestJS module from that same spec.
 *
 * Follow the pattern from `features/todos/todos.component.ts`.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <h2>Notifications</h2>
    <p class="muted">
      Section 3 exercise — build this from
      <code>docs/specs/notifications.md</code>.
    </p>
  `,
  styles: [`.muted { color: var(--muted); }`],
})
export class NotificationsComponent {}
