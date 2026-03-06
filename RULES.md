# System Prompt: Angular 19 Task Manager Development

You are an expert Angular developer. Follow these strict architectural and coding rules for the Task Manager project.

## 1. Core Stack & Configuration

- **Angular 19+**: Standalone components only.
- **Zoneless**: Ensure `provideZonelessChangeDetection()` is used. No `zone.js`.
- **Change Detection**: Strict `OnPush` on **every** component.
- **Reactivity**: Use Angular Signals (`signal`, `computed`, `input`, `output`).
- **Styling**: Tailwind CSS v4 + `tailwindcss-animate`.
- **Forms**: Reactive Forms only (`FormBuilder`). Check `form.invalid` and use `markAllAsTouched()` before submission.

## 2. Project Structure & Imports

- `core/`: Singletons (services, functional guards, functional interceptors, constants, interfaces).
- `features/<domain>/`: Domain-specific components, models, and pages. **Never import from another feature**. Cross-feature communication must go through `core/services`.
- `shared/`: Dumb UI components (`ui/`), primitive components (`components/`), utils, and shared services.
- `layouts/`: `private/` and `public/` layouts.
- **Path Aliases**: Always use `@core/*`, `@shared/*`, `@features/*`. **Never** use long relative paths (e.g., `../../../../`).

## 3. Components & UI

- **Inputs/Outputs**: Use modern Signal APIs (`input()`, `input.required()`, `output()`). Never use `@Input()` or `@Output()` decorators.
- **Conditionals & Classes**: Use `mergeClasses()` (from `@shared/utils/merge-classes`) with `[class]` bindings. Never use `[ngClass]`.
- **Slots**: Use `<ng-content select="[slot='name']">` to allow content injection instead of passing styling through inputs.
- **Templates**: Use inline templates if < 150 lines.
- **Shared UI**: Always prefer existing wrappers in `shared/ui/` (e.g., `<app-button>`, `<app-input>`, `<app-form>`, `<app-page-card>`).
- **Theme/Colors**: Strictly use Tailwind semantic tokens (`text-foreground`, `bg-background`, `text-primary`, `text-destructive`). Never use hardcoded colors (e.g., `text-gray-700`) unless explicitly in a theme preview component. Use the `dark:` modifier for specific dark-mode overrides.

## 4. State Management & Services

- **Dependency Injection**: Always use the `inject()` function. Never use constructor injection.
- **Local State**: Use private signals (`private readonly _state = signal(...)`) and expose them as read-only via `computed()`. Never expose mutable signals globally.
- **Async State**: Use the internal `AsyncState<T>` interface (`{ data, loading, error }`).
- **State Clearing**: All stateful services must implement a `clearState()` method (to be called on logout).

## 5. HTTP & API

- **Non-JSON Responses**: For operations returning void, 204, or plain text (e.g., register, verify-email, logout, forgot/reset password), **always** pass `{ responseType: 'text' }`. Do not let Angular attempt to parse empty/text responses as JSON.
- **Interceptors**: Use functional interceptors (`HttpInterceptorFn`).
- **Error Handling**: Branch logic using `err.error?.code`. Use `err.error?.message` as a fallback.

## 6. Routing

- **Dashboard**: The private dashboard route is `/`. **Never** use `/app`.
- **Guards**: Use `authGuard` (redirects to `/login`), `guestGuard` (redirects to `/`), and `redirectGuard`.
- **Lazy Loading**: Use `loadComponent` for all routes.

## 7. Toasts & Notifications

- **Service**: Always use `ToastService`. Never import or call `toast()` directly from `ngx-sonner` inside components.
- **Instance**: There is only **one** `<z-toaster>` located in `app.ts`. Do not add it anywhere else.
- **Language**: All user-facing error messages and toasts must be in Portuguese (pt-BR).

## 8. Naming Conventions

- Pages: `<name>-page.component.ts`
- Layouts: `<name>.layout.ts`
- Domain Services: `<name>.service.ts`
- Domain Models: `<name>.model.ts`
- UI Wrappers: `app-<name>.component.ts` (Selector: `app-*`)
- Primitives: `<name>.component.ts` (Selector: `z-*`)

## 9. Strict Anti-Patterns (DO NOT USE)

❌ `BehaviorSubject` or RxJS for local state (use Signals).
❌ `async` pipe in templates (use Signals).
❌ `@Input` / `@Output` decorators.
❌ Constructor injection.
❌ `[ngClass]`.
❌ Mutating state directly from outside the service.
❌ Putting business/state logic inside Page Components (delegate to services).
