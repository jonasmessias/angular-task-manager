# Angular Task Manager — Development Rules

You are an expert Angular developer. Strictly follow these rules for every change made to this project.

## 1. Stack

- **Angular 19+ standalone + zoneless** (`provideZonelessChangeDetection()`). No `zone.js`.
- **Change detection**: `ChangeDetectionStrategy.OnPush` on every component, no exceptions.
- **Reactivity**: Signals (`signal`, `computed`, `effect`, `input`, `output`). No `BehaviorSubject`, no `async` pipe.
- **Styling**: Tailwind CSS v4. Semantic tokens only (`text-foreground`, `bg-background`, `text-primary`, `text-destructive`, etc.). No hardcoded colors (`text-gray-700`).
- **Forms**: Reactive Forms via `FormBuilder`. Always call `markAllAsTouched()` and check `form.invalid` before submitting.

## 2. Structure & Imports

```
core/         → singletons: services, guards, interceptors, constants, interfaces, enums
features/     → domain pages and components (boards, cards, lists, workspaces, auth, dashboard)
shared/       → reusable: ui/ wrappers, components/ primitives, utils/, services/
layouts/      → private/ and public/ layouts
```

- **Path aliases**: always use `@core/*`, `@shared/*`, `@ui/*`, `@features/*`. Never use deep relative paths (`../../../../`).
- **No cross-feature imports**: a feature must never import from another feature. Use `core/services` for cross-domain communication.

## 3. Components

- **DI**: always `inject()`. Never constructor injection.
- **Inputs/Outputs**: always `input()`, `input.required()`, `output()`. Never `@Input()` / `@Output()`.
- **Classes**: use `mergeClasses()` from `@shared/utils/merge-classes` with `[class]` bindings. Never `[ngClass]`.
- **Templates**: inline if under ~150 lines.
- **Shared UI**: prefer existing wrappers from `shared/ui/` (`<app-button>`, `<app-input>`, `<app-textarea>`, `<app-select>`, `<app-form>`, `<app-page-header>`) over bare HTML.
- Use `[formGroup]` on the `<form>` element directly — not on `<app-form>`.
- `<app-form>` is a layout wrapper only (label + error slot); it does not accept `formGroup`.

## 4. Services & State

- Private signals for state: `private readonly _items = signal<AsyncState<T>>(initialAsyncState([]))`.
- Expose read-only via `computed()`. Never expose mutable signals publicly.
- Use `AsyncState<T>` interface (`{ data, loading, error }`) for all HTTP-backed state.
- Every stateful service must have a `clearState()` method (called on logout).

## 5. HTTP

- For endpoints that return `void`, `204`, or plain text (logout, verify-email, forgot-password, reset-password): pass `{ responseType: 'text' }`.
- Error handling: branch on `err.error?.code`, fall back to `err.error?.message`.
- Auth interceptor attaches `Authorization: Bearer <token>` automatically.

## 6. Routing

- Private dashboard is at path `''` (root `/`). Never use `/app` or `/dashboard`.
- Board detail page: `/boards/:id`.
- All routes use `loadComponent` (lazy loading).
- Guards: `authGuard` → redirect `/login`, `guestGuard` → redirect `/`, `redirectGuard` → handles post-login redirect.

## 7. Dialogs & Toasts

- **Dialogs**: `ZardDialogService.create({ zContent: MyComponent, zData: {...}, zHideFooter: true })`. The component injects `ZardDialogRef` (optional) and calls `this.dialogRef?.close(result)` to close.
- **`ZardDialogRef` has NO `afterClose` observable**. Do not use it. React to state changes through service signals instead.
- **Confirm dialogs**: `ZardAlertDialogService.confirm({ zOnOk: () => { ... } })`.
- **Toasts**: always `ToastService.success()` / `ToastService.error()`. Never call `toast()` directly. One `<z-toaster>` in `app.ts` only.
- All user-facing messages must be in **English**.

## 8. Naming

| Type           | File                       | Selector            |
| -------------- | -------------------------- | ------------------- |
| Page component | `<name>-page.component.ts` | `app-<name>-page`   |
| Layout         | `<name>.layout.ts`         | `app-<name>-layout` |
| Service        | `<name>.service.ts`        | —                   |
| Model          | `<name>.model.ts`          | —                   |
| UI wrapper     | `app-<name>.component.ts`  | `app-<name>`        |
| Primitive      | `<name>.component.ts`      | `z-<name>`          |

## 9. Anti-Patterns — Never Do

- ❌ `BehaviorSubject` or RxJS subjects for local/UI state
- ❌ `async` pipe in templates
- ❌ `@Input()` / `@Output()` decorators
- ❌ Constructor injection
- ❌ `[ngClass]`
- ❌ Deep relative imports (`../../../../`)
- ❌ Business logic inside page components — delegate to services
- ❌ Mutating service state from outside the service
- ❌ `ref.afterClose` — it does not exist on `ZardDialogRef`
- ❌ Portuguese in any user-facing string, comment, or variable name
