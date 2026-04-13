# Spec: Notifications

Small notifications feature used as the spec-driven exercise in [Section 3](../03-plans-and-specs.md). Intentionally simple so the plan can be produced and reviewed in a few minutes.

## What it does

Users can fetch a list of notifications and mark them as read.

## API

- `GET /notifications` — returns all notifications for the current user, newest first.
- `PATCH /notifications/:id/read` — marks one notification as read. Returns the updated notification.

## Data shape

```ts
type Notification = {
  id: string;
  userId: string;
  message: string;
  readAt: string | null;  // ISO timestamp; null when unread
  createdAt: string;      // ISO timestamp
};
```

## Storage

In-memory for now — follow the pattern from `apps/api/src/modules/todos/`. No database.

## Out of scope

- Auth (assume a fixed `userId = 'demo-user'`)
- Pagination
- Real-time delivery

## UI

Angular side: a `NotificationsComponent` that lists notifications and has a "mark read" button per row. Uses the same styling conventions as the existing `TodosComponent`.
