# Task Manager — Frontend Documentation

Angular · TypeScript · Tailwind CSS · Angular CDK

---

## Overview

Single Page Application (SPA) for task management built with Angular 20 (zoneless, standalone components, Signals API). Connects to a Spring Boot REST API. Implements authentication with JWT + refresh token, workspace/board/list/card hierarchy, member collaboration, and a custom design system.

---

## Tech Stack

| Technology | Version | Purpose |
| ----------------------- | ------- | ----------------------------------------- |
| Angular | 20.3 | Framework (zoneless change detection) |
| TypeScript | 5.9 | Language |
| Tailwind CSS | 4.1 | Utility-first styling |
| Angular CDK | 20.2 | Overlay, Portal, A11y, Drag & Drop |
| RxJS | 7.8 | Reactive HTTP and state management |
| Lucide Angular | 0.553 | Icon library |
| ngx-sonner | 3.1 | Toast notifications |
| class-variance-authority | 0.7 | Component variant system (CVA) |
| tailwind-merge | 3.3 | Merge Tailwind classes without conflicts |
| clsx | 2.1 | Conditional class utility |

---

## Architecture

### Principles

- **Zoneless** — `provideZonelessChangeDetection()` instead of Zone.js. All reactivity via Angular Signals.
- **Standalone** — Every component, directive, and pipe is standalone. No `NgModule` declarations.
- **Lazy Loading** — All feature pages are lazy-loaded via `loadComponent()` in routes.
- **Feature-based** — Code organized by domain feature, not by technical layer.
- **Reactive state** — Services use `signal()` / `computed()` for local state, `Observable` for HTTP calls.

### Module Structure

```
src/app/
├── app.config.ts          # Application providers (zoneless, router, HTTP, interceptors)
├── app.routes.ts           # Route definitions with guards and lazy loading
├── core/                   # Singleton services, guards, interceptors, constants
│   ├── constants/          # API endpoints, error codes, regex patterns
│   ├── enums/              # Storage keys
│   ├── guards/             # Route guards (auth, guest, redirect)
│   ├── interceptors/       # HTTP interceptors (auth, error)
│   ├── interfaces/         # API response, async state, pagination
│   └── services/           # Auth, Board, Workspace, Theme services
├── features/               # Feature modules (pages + feature components)
│   ├── auth/               # Login, Register, Forgot/Reset Password, Verify Email
│   ├── boards/             # Board list page, Board detail page
│   ├── cards/              # Card model and card components
│   ├── dashboard/          # Dashboard (home) page
│   ├── lists/              # List model and list components
│   └── workspaces/         # Workspace home, workspace settings, member model
├── layouts/                # Page layouts
│   ├── private/            # Authenticated layout (navbar + sidebar + main)
│   └── public/             # Guest layout (centered card)
└── shared/                 # Reusable code shared across features
    ├── components/         # Design system components (44 components)
    ├── services/           # Toast service
    ├── ui/                 # Application-level UI components
    └── utils/              # Utility functions (slug, merge-classes, number)
```

---

## Application Bootstrap

```
main.ts → bootstrapApplication(AppComponent, appConfig)
```

### Providers (`app.config.ts`)

| Provider | Purpose |
| ----------------------------------- | --------------------------------------------------------- |
| `provideZonelessChangeDetection()` | Removes Zone.js, uses Signals for change detection |
| `provideRouter(routes, withViewTransitions())` | Router with CSS view transitions |
| `provideHttpClient(withInterceptors([...]))` | HTTP client with auth + error interceptors |
| `APP_INITIALIZER` | Calls `AuthService.init()` to restore session on startup |

### Startup Flow

```
1. App loads → APP_INITIALIZER runs
2. AuthService.init() checks localStorage for access token
3. If token exists → GET /users/me to load profile
4. If 401 → tries refresh token → retries profile
5. If refresh fails → clears session (user sees login)
6. Router activates → authGuard checks isAuthenticated()
```

---

## Routing

### Private Routes (requires authentication)

| Path | Component | Description |
| --------------------------- | --------------------------------- | -------------------------------- |
| `/` | `DashboardComponent` | Home / Dashboard |
| `/u/:username/boards` | `BoardsPageComponent` | All boards grouped by workspace |
| `/b/:boardId/:boardSlug` | `BoardDetailPageComponent` | Board with lists and cards |
| `/w/:workspaceSlug/home` | `WorkspaceHomePageComponent` | Workspace boards |
| `/w/:workspaceSlug/account` | `WorkspaceAccountPageComponent` | Workspace settings (rename/delete)|

### Public Routes (guest only)

| Path | Component | Description |
| ------------------- | ------------------------------ | ---------------------- |
| `/login` | `LoginPageComponent` | Login form |
| `/register` | `RegisterPageComponent` | Registration form |
| `/forgot-password` | `ForgotPasswordPageComponent` | Request password reset |
| `/reset-password` | `ResetPasswordPageComponent` | Set new password |
| `/verify-email` | `VerifyEmailPageComponent` | Email verification |

### Route Guards

| Guard | Behavior |
| --------------- | ----------------------------------------------------------- |
| `authGuard` | Redirects to `/login` if not authenticated |
| `guestGuard` | Redirects to `/` if already authenticated |
| `redirectGuard` | Ensures authenticated users can access private routes |

### URL Slug Strategy

All URL slugs are generated client-side via `src/app/shared/utils/slug.ts`:

| Function | Example |
| ----------------------- | -------------------------------------------- |
| `boardsPath(username)` | `/u/johndoe/boards` |
| `boardPath(id, name)` | `/b/abc123/my-project` |
| `workspaceSegment(id, name)` | `my-workspace-abc123` |
| `workspaceHomePath(id, name)` | `/w/my-workspace-abc123/home` |
| `workspaceAccountPath(id, name)` | `/w/my-workspace-abc123/account` |

---

## Layouts

### Private Layout

```
┌──────────────────────────────────────────────┐
│  Navbar (fixed top, full width)              │
├────────────┬─────────────────────────────────┤
│  Sidebar   │  <main> (router-outlet)         │
│  (320px)   │  px-12 pb-12                    │
│            │                                 │
│  - Home    │                                 │
│  - Boards  │                                 │
│  - WS 1    │                                 │
│  - WS 2    │                                 │
└────────────┴─────────────────────────────────┘
```

- **Navbar**: Logo, Create board popover (CDK Overlay), theme toggle, user dropdown
- **Sidebar**: Home / Boards links, collapsible workspace sections (boards + settings sub-links)

### Public Layout

```
┌──────────────────────────────────┐
│         Centered card            │
│         (max-w-sm)               │
│                                  │
│      Logo + router-outlet        │
└──────────────────────────────────┘
```

---

## Core Layer (`src/app/core/`)

### Services

#### `AuthService`

Manages authentication state, session persistence, and user profile.

| Method | API Call | Description |
| --------------------- | ----------------------------- | ----------------------------------------- |
| `init()` | `GET /users/me` | Restore session on app startup |
| `login(dto)` | `POST /auth/login` | Login + save tokens + load profile |
| `register(dto)` | `POST /auth/register` | Create account |
| `logout()` | `POST /auth/logout` | Invalidate session, clear storage |
| `refreshToken()` | `POST /auth/refresh` | Get new access token |
| `forgotPassword(dto)` | `POST /auth/forgot-password` | Send password reset email |
| `resetPassword(dto)` | `POST /auth/reset-password` | Reset with token |
| `verifyEmail(dto)` | `POST /auth/verify-email` | Verify email with token |
| `resendVerification(dto)` | `POST /auth/resend-verification` | Resend verification email |
| `getProfile()` | `GET /users/me` | Load current user profile |
| `updateProfile(dto)` | `PUT /users/me` | Update name/username |
| `deleteAccount()` | `DELETE /users/me` | Delete own account |
| `getUserById(id)` | `GET /users/{id}` | Get user by ID |

**Signals:**
- `isAuthenticated: Signal<boolean>` — derived from access token presence
- `currentUser: Signal<User | null>` — current user profile

**Session Storage:**
- `localStorage[ACCESS_TOKEN]` — JWT access token
- `localStorage[REFRESH_TOKEN]` — JWT refresh token

#### `WorkspaceService`

Manages workspaces with reactive signal-based state.

| Method | API Call | Description |
| -------------------- | ---------------------------------------- | ------------------------------- |
| `loadAll()` | `GET /workspaces` | Load all user workspaces |
| `loadById(id)` | `GET /workspaces/{id}` | Load workspace detail |
| `create(dto)` | `POST /workspaces` | Create workspace |
| `update(id, dto)` | `PUT /workspaces/{id}` | Update workspace |
| `delete(id)` | `DELETE /workspaces/{id}` | Delete workspace |
| `getMembers(id)` | `GET /workspaces/{id}/members` | List workspace members |
| `inviteMember(id, dto)` | `POST /workspaces/{id}/members` | Invite member |
| `removeMember(id, userId)` | `DELETE /workspaces/{id}/members/{userId}` | Remove member |

**Signals:**
- `workspaces: Signal<WorkspaceResponse[]>` — all workspaces
- `workspacesLoading: Signal<boolean>`
- `activeWorkspace: Signal<WorkspaceDetail | null>` — currently viewed workspace
- `activeWorkspaceId: Signal<string | null>` — persisted to localStorage
- `hasWorkspaces: Signal<boolean>`

#### `BoardService`

Manages boards, lists, and cards with nested state updates.

| Method | API Call | Description |
| -------------------------------- | ------------------------------------------------ | ----------------------------- |
| `loadAll(workspaceId)` | `GET /boards?workspaceId={id}` | Load boards for workspace |
| `openBoard(id)` | `GET /boards/{id}` | Load board with lists + cards |
| `create(workspaceId, dto)` | `POST /boards?workspaceId={id}` | Create board |
| `update(id, dto)` | `PUT /boards/{id}` | Update board |
| `delete(id)` | `DELETE /boards/{id}` | Delete board |
| `addList(boardId, dto)` | `POST /boards/{boardId}/lists` | Create list |
| `updateList(boardId, listId, dto)` | `PUT /boards/{boardId}/lists/{listId}` | Update list |
| `deleteList(boardId, listId)` | `DELETE /boards/{boardId}/lists/{listId}` | Delete list |
| `addCard(boardId, listId, dto)` | `POST .../lists/{listId}/cards` | Create card |
| `updateCard(boardId, listId, cardId, dto)` | `PUT .../cards/{cardId}` | Update card |
| `moveCard(boardId, cardId, from, to, pos)` | `PATCH .../cards/{cardId}/move` | Move card (optimistic) |
| `deleteCard(boardId, listId, cardId)` | `DELETE .../cards/{cardId}` | Delete card |
| `getBoardMembers(boardId)` | `GET /boards/{id}/members` | List board members |
| `inviteBoardMember(boardId, dto)` | `POST /boards/{id}/members` | Invite member |
| `removeBoardMember(boardId, userId)` | `DELETE /boards/{id}/members/{userId}` | Remove member |

**Signals:**
- `boards: Signal<BoardResponse[]>`
- `activeBoard: Signal<BoardDetail | null>` — board with embedded lists and cards
- `lists: Signal<ListWithCards[]>` — sorted by position

**Optimistic Updates:**
The `moveCard()` method updates local state immediately before the API responds, providing instant drag-and-drop feedback.

#### `ThemeService`

Manages light/dark/system theme with `prefers-color-scheme` media query listener.

| Signal | Type | Description |
| -------------- | -------------------- | ---------------------------------- |
| `currentTheme` | `Signal<Theme>` | Stored preference (light/dark/system) |
| `isDark` | `Signal<boolean>` | Resolved dark mode state |

Persisted to `localStorage[THEME]`.

### HTTP Interceptors

#### `authInterceptor`

1. Attaches `Authorization: Bearer <token>` to every request (except auth routes)
2. On `401` → automatically calls `POST /auth/refresh` and retries the original request
3. On `EMAIL_NOT_VERIFIED` error code → redirects to `/verify-email`
4. If refresh fails → clears session and redirects to `/login`

#### `errorInterceptor`

| HTTP Status | Behavior |
| ----------- | -------------------------------------------------- |
| `0` | Toast: "Unable to reach the server..." (API offline / no network) |
| `503` / `504` | Toast: "Server temporarily unavailable..." |
| `500+` | Toast: "Unexpected server error..." |
| `4xx` | Passed through (handled by calling service) |

### Constants

#### API Endpoints (`api-endpoints.const.ts`)

All endpoints are centralized and derived from `environment.apiUrl`:

```
AUTH:       login, register, logout, logout-all, refresh, forgot-password,
            reset-password, verify-email, resend-verification
USERS:      me, by-id
WORKSPACES: all, by-id, members, member
BOARDS:     all, by-id, members, member
LISTS:      all(boardId), by-id(boardId, listId)
CARDS:      all(boardId, listId), by-id(..., cardId), move(..., cardId)
```

#### Error Codes (`api-error-codes.const.ts`)

Maps all API error codes as TypeScript constants:

| Category | Codes |
| -------------- | ----------------------------------------------------------------- |
| Authentication | `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `EMAIL_NOT_FOUND` |
| Registration | `EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `PASSWORDS_DO_NOT_MATCH` |
| Token | `INVALID_TOKEN`, `EXPIRED_TOKEN` |
| Email | `EMAIL_SEND_ERROR`, `EMAIL_AUTH_ERROR` |
| Members | `USER_NOT_FOUND`, `USER_ALREADY_MEMBER`, `USER_NOT_IN_WORKSPACE`, `MEMBER_NOT_FOUND`, `CANNOT_REMOVE_OWNER` |
| Resources | `WORKSPACE_NOT_FOUND`, `BOARD_NOT_FOUND`, `LIST_NOT_FOUND`, `CARD_NOT_FOUND` |
| General | `FORBIDDEN`, `VALIDATION_ERROR` |

### Interfaces

#### `AsyncState<T>`

Generic state wrapper used by services for loading/error tracking:

```typescript
interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}
```

#### `ApiError`

Standard error response from the API:

```typescript
interface ApiError {
  code?: string;
  message: string;
  statusCode: number;
  timestamp?: string;
  errors?: { field: string; message: string }[];  // validation errors
}
```

#### `PaginatedResponse<T>`

Used for paginated endpoints (cards, boards):

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

---

## Features

### Auth (`features/auth/`)

| Page | Route | Description |
| ---------------------- | ------------------- | --------------------------------------- |
| `LoginPageComponent` | `/login` | Email/username + password login form |
| `RegisterPageComponent`| `/register` | Name, username, email, password form |
| `ForgotPasswordPageComponent` | `/forgot-password` | Email input → sends reset link |
| `ResetPasswordPageComponent` | `/reset-password` | Token + new password form |
| `VerifyEmailPageComponent` | `/verify-email` | Token verification + resend option |

### Boards (`features/boards/`)

| Page | Route | Description |
| ----------------------- | ----------------------------- | ---------------------------------------- |
| `BoardsPageComponent` | `/u/:username/boards` | All boards grouped by workspace sections |
| `BoardDetailPageComponent` | `/b/:boardId/:boardSlug` | Kanban board with lists and cards |

### Workspaces (`features/workspaces/`)

| Page | Route | Description |
| -------------------------------- | ----------------------------- | -------------------------------------- |
| `WorkspaceHomePageComponent` | `/w/:workspaceSlug/home` | Workspace boards |
| `WorkspaceAccountPageComponent` | `/w/:workspaceSlug/account` | Rename workspace, delete workspace |

### Dashboard (`features/dashboard/`)

| Page | Route | Description |
| -------------------- | ----- | --------- |
| `DashboardComponent` | `/` | Home page |

---

## Data Models

### Auth

```typescript
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface AuthResponse {
  name: string;
  accessToken: string;
  refreshToken: string;
}

interface UpdateProfileDto {
  name?: string;
  username?: string;
}
```

### Workspaces

```typescript
interface WorkspaceResponse {
  id: string;
  name: string;
  boardCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceDetail {
  id: string;
  name: string;
  boards: BoardResponse[];
  createdAt: string;
  updatedAt: string;
}
```

### Boards

```typescript
interface BoardResponse {
  id: string;
  name: string;
  type: 'BOARD';
  description: string;
  ownerId: string;
  ownerName: string;
  listsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BoardDetail extends Omit<BoardResponse, 'listsCount'> {
  lists: ListWithCards[];
}
```

### Lists

```typescript
interface ListResponse {
  id: string;
  name: string;
  position: number;
  boardId: string;
}

interface ListWithCards extends ListResponse {
  cards: CardResponse[];
}
```

### Cards

```typescript
type CardStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

interface CardResponse {
  id: string;
  name: string;
  description: string;
  status: CardStatus;
  position: number;
  listId: string;
  listName: string;
  createdAt: string;
  updatedAt: string;
}
```

### Members

```typescript
type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

interface MemberResponse {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}
```

---

## Shared Layer

### Design System Components (`shared/components/`)

44 reusable UI components built with Angular CDK, CVA (class-variance-authority), and Tailwind CSS:

| Category | Components |
| ------------ | ----------------------------------------------------------------- |
| Layout | accordion, breadcrumb, card, divider, layout, resizable, tabs |
| Forms | checkbox, combobox, command, form, input, input-group, radio, select, slider, switch, toggle, toggle-group |
| Feedback | alert, alert-dialog, dialog, loader, progress-bar, skeleton, toast, tooltip |
| Navigation | button, dropdown, menu, pagination, popover, sheet |
| Data Display | avatar, badge, calendar, date-picker, empty, icon, table |
| Theme | theme-toggle |
| Overlay | dialog, alert-dialog, popover, sheet (all use CDK Overlay + Portal) |

All overlay components (Dialog, Alert Dialog, Popover, Sheet) use:
- **CDK Overlay** for positioning and backdrop
- **CDK Portal** for rendering content into the overlay container
- **CSS `data-state`** transitions for open/close animations (no `@angular/animations`)

### Application UI Components (`shared/ui/`)

| Component | Description |
| ---------------------- | ------------------------------------------------ |
| `AppButtonComponent` | Styled button with loading state |
| `AppInputComponent` | Form input with label, error display, `[control]` binding |
| `AppSelectComponent` | Select dropdown with form control |
| `AppTextareaComponent` | Textarea with form control |
| `AppCheckboxComponent` | Checkbox with form control |
| `BoardGridComponent` | Reusable board card grid with skeleton loading |
| `PageContainerComponent` | Standardized page wrapper (max-w-228.5, mt-5, mx-auto) |
| `PageHeaderComponent` | Page title + description header |
| `AppCardComponent` | Card wrapper |
| `AppBadgeComponent` | Status badge |
| `AppFormComponent` | Form wrapper |

### Utility Functions (`shared/utils/`)

| File | Exports |
| ------------------- | -------------------------------------------------------- |
| `slug.ts` | `toSlug()`, `boardsPath()`, `boardPath()`, `workspaceSegment()`, `workspaceHomePath()`, `workspaceAccountPath()` |
| `merge-classes.ts` | `mergeClasses()` (clsx + tailwind-merge), `transform()`, `generateId()` |
| `number.ts` | Number formatting utilities |

### Services

| Service | Description |
| -------------- | -------------------------------------- |
| `ToastService` | Wrapper around `ngx-sonner` for toast notifications (`success`, `error`, `info`) |

---

## State Management

The application uses **Angular Signals** for local state management instead of NgRx or other external state libraries.

### Pattern

```
Service (signal-based state)
  ├── Private signals      → _workspaces, _activeBoard, _currentUser
  ├── Public selectors     → computed() readonly signals exposed to components
  └── Actions              → methods that call HTTP + update signals via tap()
```

### Data Flow

```
Component → calls service method (e.g. boardService.create())
  → HTTP POST (Observable)
    → tap() updates local signal state
      → computed() signals automatically recompute
        → component template re-renders (zoneless)
```

### Persisted State

| Key | Storage | Service |
| -------------------------------- | ------------- | ------------------ |
| `task_manager_access_token` | localStorage | AuthService |
| `task_manager_refresh_token` | localStorage | AuthService |
| `task_manager_active_workspace_id` | localStorage | WorkspaceService |
| `taskmanager-theme` | localStorage | ThemeService |

---

## Environments

| File | `apiUrl` | `production` |
| ----------------------- | ------------------------ | ------------ |
| `environment.ts` | `http://localhost:8080` | `false` |
| `environment.prod.ts` | `http://localhost:8080` | `true` |

---

## Development

### Prerequisites

- Node.js 20+
- npm 10+
- Angular CLI 20+

### Setup

```bash
git clone https://github.com/jonasmessias/task-manager-angular.git
cd task-manager-angular
npm install
```

### Run

```bash
ng serve          # http://localhost:4200
```

### Build

```bash
ng build          # production build → dist/
```

### Test

```bash
ng test           # Karma + Jasmine
```

### Code Style

- Prettier (printWidth: 100, singleQuote)
- Angular template parser for HTML files

---

## API Integration

The frontend expects the Task Manager API running at `http://localhost:8080`.

### Required API Endpoints

| Module | Endpoints |
| ---------- | ------------------------------------------------ |
| Auth | register, login, logout, logout-all, refresh, verify-email, resend-verification, forgot-password, reset-password |
| Users | GET /users/me, PUT /users/me, DELETE /users/me, GET /users/{id} |
| Workspaces | CRUD + members (list, invite, remove) |
| Boards | CRUD + members (list, invite, remove) |
| Lists | CRUD (nested under boards) |
| Cards | CRUD + move (nested under boards/lists) |

### Authentication Headers

All protected requests include:

```
Authorization: Bearer <access_token>
```

Token refresh is handled transparently by the `authInterceptor`.

---

_Last updated: March 19, 2026_
