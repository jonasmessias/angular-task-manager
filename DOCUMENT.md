# Task Manager — Documentação do Frontend# Task Manager — Frontend Documentation

Angular · TypeScript · Tailwind CSS · Angular CDKAngular · TypeScript · Tailwind CSS · Angular CDK

---

## Visão Geral## Overview

Aplicação Single Page Application (SPA) para gerenciamento de tarefas construída com Angular 20 (zoneless, standalone components, Signals API). Conecta-se a uma API REST Spring Boot. Implementa autenticação com JWT + refresh token, hierarquia workspace/board/list/card, colaboração via membros, e um design system customizado.Single Page Application (SPA) for task management built with Angular 20 (zoneless, standalone components, Signals API). Connects to a Spring Boot REST API. Implements authentication with JWT + refresh token, workspace/board/list/card hierarchy, member collaboration, and a custom design system.

---

## Stack Tecnológica## Tech Stack

| Tecnologia | Versão | Finalidade || Technology | Version | Purpose |

| ------------------------ | ------ | --------------------------------------- || ------------------------ | ------- | ---------------------------------------- |

| Angular | 20.3 | Framework (zoneless change detection) || Angular | 20.3 | Framework (zoneless change detection) |

| TypeScript | 5.9 | Linguagem || TypeScript | 5.9 | Language |

| Tailwind CSS | 4.1 | Estilização utilitária || Tailwind CSS | 4.1 | Utility-first styling |

| Angular CDK | 20.2 | Overlay, Portal, A11y, Drag & Drop || Angular CDK | 20.2 | Overlay, Portal, A11y, Drag & Drop |

| RxJS | 7.8 | HTTP reativo e gerenciamento de estado || RxJS | 7.8 | Reactive HTTP and state management |

| Lucide Angular | 0.553 | Biblioteca de ícones || Lucide Angular | 0.553 | Icon library |

| ngx-sonner | 3.1 | Notificações toast || ngx-sonner | 3.1 | Toast notifications |

| class-variance-authority | 0.7 | Sistema de variantes de componentes || class-variance-authority | 0.7 | Component variant system (CVA) |

| tailwind-merge | 3.3 | Merge de classes Tailwind sem conflitos || tailwind-merge | 3.3 | Merge Tailwind classes without conflicts |

| clsx | 2.1 | Utilitário de classes condicionais || clsx | 2.1 | Conditional class utility |

---

## Arquitetura## Architecture

### Princípios### Principles

- **Zoneless** — `provideZonelessChangeDetection()` em vez de Zone.js. Toda reatividade via Angular Signals.- **Zoneless** — `provideZonelessChangeDetection()` instead of Zone.js. All reactivity via Angular Signals.

- **Standalone** — Todo componente, diretiva e pipe é standalone. Sem declarações de `NgModule`.- **Standalone** — Every component, directive, and pipe is standalone. No `NgModule` declarations.

- **Lazy Loading** — Todas as páginas de feature são carregadas sob demanda via `loadComponent()` nas rotas.- **Lazy Loading** — All feature pages are lazy-loaded via `loadComponent()` in routes.

- **Baseado em Features** — Código organizado por domínio de feature, não por camada técnica.- **Feature-based** — Code organized by domain feature, not by technical layer.

- **Estado reativo** — Serviços usam `signal()` / `computed()` para estado local, `Observable` para chamadas HTTP.- **Reactive state** — Services use `signal()` / `computed()` for local state, `Observable` for HTTP calls.

### Estrutura de Módulos### Module Structure

```

src/app/src/app/

├── app.config.ts          # Providers da aplicação (zoneless, router, HTTP, interceptors)├── app.config.ts          # Application providers (zoneless, router, HTTP, interceptors)

├── app.routes.ts           # Definição de rotas com guards e lazy loading├── app.routes.ts           # Route definitions with guards and lazy loading

├── core/                   # Serviços singleton, guards, interceptors, constantes├── core/                   # Singleton services, guards, interceptors, constants

│   ├── constants/          # Endpoints da API, códigos de erro, padrões regex│   ├── constants/          # API endpoints, error codes, regex patterns

│   ├── enums/              # Chaves de armazenamento│   ├── enums/              # Storage keys

│   ├── guards/             # Guards de rota (auth, guest, redirect)│   ├── guards/             # Route guards (auth, guest, redirect)

│   ├── interceptors/       # Interceptors HTTP (auth, error)│   ├── interceptors/       # HTTP interceptors (auth, error)

│   ├── interfaces/         # Resposta da API, estado assíncrono, paginação│   ├── interfaces/         # API response, async state, pagination

│   └── services/           # Serviços Auth, Board, Workspace, Theme│   └── services/           # Auth, Board, Workspace, Theme services

├── features/               # Módulos de feature (páginas + componentes de feature)├── features/               # Feature modules (pages + feature components)

│   ├── auth/               # Login, Registro, Recuperação/Reset de Senha, Verificação de Email│   ├── auth/               # Login, Register, Forgot/Reset Password, Verify Email

│   ├── boards/             # Página de lista de boards, Página de detalhe do board│   ├── boards/             # Board list page, Board detail page

│   ├── cards/              # Modelo de card e componentes de card│   ├── cards/              # Card model and card components

│   ├── dashboard/          # Página inicial (Dashboard)│   ├── dashboard/          # Dashboard (home) page

│   ├── lists/              # Modelo de lista e componentes de lista│   ├── lists/              # List model and list components

│   └── workspaces/         # Home do workspace, Configurações do workspace, Modelo de membro│   └── workspaces/         # Workspace home, workspace settings, member model

├── layouts/                # Layouts de página├── layouts/                # Page layouts

│   ├── private/            # Layout autenticado (navbar + sidebar + main)│   ├── private/            # Authenticated layout (navbar + sidebar + main)

│   └── public/             # Layout visitante (card centralizado)│   └── public/             # Guest layout (centered card)

└── shared/                 # Código reutilizável compartilhado entre features└── shared/                 # Reusable code shared across features

    ├── components/         # Componentes do design system (44 componentes)    ├── components/         # Design system components (44 components)

    ├── services/           # Serviço de toast    ├── services/           # Toast service

    ├── ui/                 # Componentes de UI da aplicação    ├── ui/                 # Application-level UI components

    └── utils/              # Funções utilitárias (slug, merge-classes, number)    └── utils/              # Utility functions (slug, merge-classes, number)

```

---

## Bootstrap da Aplicação## Application Bootstrap

```

main.ts → bootstrapApplication(AppComponent, appConfig)main.ts → bootstrapApplication(AppComponent, appConfig)

```

### Providers (`app.config.ts`)### Providers (`app.config.ts`)

| Provider | Finalidade || Provider | Purpose |

| ---------------------------------------------- | ------------------------------------------------------------- || ---------------------------------------------- | -------------------------------------------------------- |

| `provideZonelessChangeDetection()` | Remove Zone.js, usa Signals para detecção de mudanças || `provideZonelessChangeDetection()` | Removes Zone.js, uses Signals for change detection |

| `provideRouter(routes, withViewTransitions())` | Router com transições CSS entre views || `provideRouter(routes, withViewTransitions())` | Router with CSS view transitions |

| `provideHttpClient(withInterceptors([...]))` | Cliente HTTP com interceptors de auth + error || `provideHttpClient(withInterceptors([...]))` | HTTP client with auth + error interceptors |

| `APP_INITIALIZER` | Chama `AuthService.init()` para restaurar sessão na inicialização || `APP_INITIALIZER` | Calls `AuthService.init()` to restore session on startup |

### Fluxo de Inicialização### Startup Flow

```

1. App carrega → APP_INITIALIZER executa1. App loads → APP_INITIALIZER runs

2. AuthService.init() verifica localStorage por access token2. AuthService.init() checks localStorage for access token

3. Se token existe → GET /users/me para carregar perfil3. If token exists → GET /users/me to load profile

4. Se 401 → tenta refresh token → retenta carregar perfil4. If 401 → tries refresh token → retries profile

5. Se refresh falha → limpa sessão (usuário vê tela de login)5. If refresh fails → clears session (user sees login)

6. Router ativa → authGuard verifica isAuthenticated()6. Router activates → authGuard checks isAuthenticated()

```

---

## Rotas## Routing

### Rotas Privadas (requer autenticação)### Private Routes (requires authentication)

| Caminho | Componente | Descrição || Path | Component | Description |

| --------------------------- | ------------------------------- | --------------------------------------- || --------------------------- | ------------------------------- | ---------------------------------- |

| `/` | `DashboardComponent` | Página inicial / Dashboard || `/` | `DashboardComponent` | Home / Dashboard |

| `/u/:username/boards` | `BoardsPageComponent` | Todos os boards agrupados por workspace || `/u/:username/boards` | `BoardsPageComponent` | All boards grouped by workspace |

| `/b/:boardId/:boardSlug` | `BoardDetailPageComponent` | Board com listas e cards || `/b/:boardId/:boardSlug` | `BoardDetailPageComponent` | Board with lists and cards |

| `/w/:workspaceSlug/home` | `WorkspaceHomePageComponent` | Boards do workspace || `/w/:workspaceSlug/home` | `WorkspaceHomePageComponent` | Workspace boards |

| `/w/:workspaceSlug/account` | `WorkspaceAccountPageComponent` | Configurações do workspace (renomear/excluir) || `/w/:workspaceSlug/account` | `WorkspaceAccountPageComponent` | Workspace settings (rename/delete) |

### Rotas Públicas (apenas visitantes)### Public Routes (guest only)

| Caminho | Componente | Descrição || Path | Component | Description |

| ------------------ | ------------------------------ | ------------------------ || ------------------ | ----------------------------- | ---------------------- |

| `/login` | `LoginPageComponent` | Formulário de login || `/login` | `LoginPageComponent` | Login form |

| `/register` | `RegisterPageComponent` | Formulário de registro || `/register` | `RegisterPageComponent` | Registration form |

| `/forgot-password` | `ForgotPasswordPageComponent` | Solicitar reset de senha || `/forgot-password` | `ForgotPasswordPageComponent` | Request password reset |

| `/reset-password` | `ResetPasswordPageComponent` | Definir nova senha || `/reset-password` | `ResetPasswordPageComponent` | Set new password |

| `/verify-email` | `VerifyEmailPageComponent` | Verificação de email || `/verify-email` | `VerifyEmailPageComponent` | Email verification |

### Guards de Rota### Route Guards

| Guard | Comportamento || Guard | Behavior |

| --------------- | -------------------------------------------------------------------- || --------------- | ----------------------------------------------------- |

| `authGuard` | Redireciona para `/login` se não autenticado || `authGuard` | Redirects to `/login` if not authenticated |

| `guestGuard` | Redireciona para `/` se já autenticado || `guestGuard` | Redirects to `/` if already authenticated |

| `redirectGuard` | Garante que usuários autenticados possam acessar rotas privadas || `redirectGuard` | Ensures authenticated users can access private routes |

### Estratégia de Slugs nas URLs### URL Slug Strategy

Todos os slugs de URL são gerados no lado do cliente via `src/app/shared/utils/slug.ts`:All URL slugs are generated client-side via `src/app/shared/utils/slug.ts`:

| Função | Exemplo || Function | Example |

| -------------------------------- | -------------------------------- || -------------------------------- | -------------------------------- |

| `boardsPath(username)` | `/u/johndoe/boards` || `boardsPath(username)` | `/u/johndoe/boards` |

| `boardPath(id, name)` | `/b/abc123/my-project` || `boardPath(id, name)` | `/b/abc123/my-project` |

| `workspaceSegment(id, name)` | `my-workspace-abc123` || `workspaceSegment(id, name)` | `my-workspace-abc123` |

| `workspaceHomePath(id, name)` | `/w/my-workspace-abc123/home` || `workspaceHomePath(id, name)` | `/w/my-workspace-abc123/home` |

| `workspaceAccountPath(id, name)` | `/w/my-workspace-abc123/account` || `workspaceAccountPath(id, name)` | `/w/my-workspace-abc123/account` |

---

## Layouts## Layouts

### Layout Privado### Private Layout

```

┌──────────────────────────────────────────────┐┌──────────────────────────────────────────────┐

│  Navbar (fixo no topo, largura total)        ││  Navbar (fixed top, full width)              │

├────────────┬─────────────────────────────────┤├────────────┬─────────────────────────────────┤

│  Sidebar   │  <main> (router-outlet)         ││  Sidebar   │  <main> (router-outlet)         │

│  (320px)   │  px-12 pb-12                    ││  (320px)   │  px-12 pb-12                    │

│            │                                 ││            │                                 │

│  - Home    │                                 ││  - Home    │                                 │

│  - Boards  │                                 ││  - Boards  │                                 │

│  - WS 1    │                                 ││  - WS 1    │                                 │

│  - WS 2    │                                 ││  - WS 2    │                                 │

└────────────┴─────────────────────────────────┘└────────────┴─────────────────────────────────┘

```

- **Navbar**: Logo, popover "Criar" board (CDK Overlay), alternância de tema, dropdown do usuário- **Navbar**: Logo, Create board popover (CDK Overlay), theme toggle, user dropdown

- **Sidebar**: Links Home / Boards, seções colapsáveis de workspace (boards + sub-links de configurações)- **Sidebar**: Home / Boards links, collapsible workspace sections (boards + settings sub-links)

### Layout Público### Public Layout

```

┌──────────────────────────────────┐┌──────────────────────────────────┐

│         Card centralizado        ││         Centered card            │

│         (max-w-sm)               ││         (max-w-sm)               │

│                                  ││                                  │

│      Logo + router-outlet        ││      Logo + router-outlet        │

└──────────────────────────────────┘└──────────────────────────────────┘

```

---

## Camada Core (`src/app/core/`)## Core Layer (`src/app/core/`)

### Serviços### Services

#### `AuthService`#### `AuthService`

Gerencia estado de autenticação, persistência de sessão e perfil do usuário.Manages authentication state, session persistence, and user profile.

| Método | Chamada à API | Descrição || Method | API Call | Description |

| ------------------------- | -------------------------------- | -------------------------------------- || ------------------------- | -------------------------------- | ---------------------------------- |

| `init()` | `GET /users/me` | Restaurar sessão ao iniciar app || `init()` | `GET /users/me` | Restore session on app startup |

| `login(dto)` | `POST /auth/login` | Login + salvar tokens + carregar perfil || `login(dto)` | `POST /auth/login` | Login + save tokens + load profile |

| `register(dto)` | `POST /auth/register` | Criar conta || `register(dto)` | `POST /auth/register` | Create account |

| `logout()` | `POST /auth/logout` | Invalidar sessão, limpar storage || `logout()` | `POST /auth/logout` | Invalidate session, clear storage |

| `refreshToken()` | `POST /auth/refresh` | Obter novo access token || `refreshToken()` | `POST /auth/refresh` | Get new access token |

| `forgotPassword(dto)` | `POST /auth/forgot-password` | Enviar email de reset de senha || `forgotPassword(dto)` | `POST /auth/forgot-password` | Send password reset email |

| `resetPassword(dto)` | `POST /auth/reset-password` | Resetar com token || `resetPassword(dto)` | `POST /auth/reset-password` | Reset with token |

| `verifyEmail(dto)` | `POST /auth/verify-email` | Verificar email com token || `verifyEmail(dto)` | `POST /auth/verify-email` | Verify email with token |

| `resendVerification(dto)` | `POST /auth/resend-verification` | Reenviar email de verificação || `resendVerification(dto)` | `POST /auth/resend-verification` | Resend verification email |

| `getProfile()` | `GET /users/me` | Carregar perfil do usuário atual || `getProfile()` | `GET /users/me` | Load current user profile |

| `updateProfile(dto)` | `PUT /users/me` | Atualizar nome/username || `updateProfile(dto)` | `PUT /users/me` | Update name/username |

| `deleteAccount()` | `DELETE /users/me` | Excluir própria conta || `deleteAccount()` | `DELETE /users/me` | Delete own account |

| `getUserById(id)` | `GET /users/{id}` | Obter usuário por ID || `getUserById(id)` | `GET /users/{id}` | Get user by ID |

**Signals:\*\***Signals:\*\*

- `isAuthenticated: Signal<boolean>` — derivado da presença do access token- `isAuthenticated: Signal<boolean>` — derived from access token presence

- `currentUser: Signal<User | null>` — perfil do usuário atual- `currentUser: Signal<User | null>` — current user profile

**Armazenamento de Sessão:\*\***Session Storage:\*\*

- `localStorage[ACCESS_TOKEN]` — JWT access token- `localStorage[ACCESS_TOKEN]` — JWT access token

- `localStorage[REFRESH_TOKEN]` — JWT refresh token- `localStorage[REFRESH_TOKEN]` — JWT refresh token

#### `WorkspaceService`#### `WorkspaceService`

Gerencia workspaces com estado reativo baseado em signals.Manages workspaces with reactive signal-based state.

| Método | Chamada à API | Descrição || Method | API Call | Description |

| -------------------------- | ------------------------------------------ | ------------------------------ || -------------------------- | ------------------------------------------ | ------------------------ |

| `loadAll()` | `GET /workspaces` | Carregar todos os workspaces || `loadAll()` | `GET /workspaces` | Load all user workspaces |

| `loadById(id)` | `GET /workspaces/{id}` | Carregar detalhe do workspace || `loadById(id)` | `GET /workspaces/{id}` | Load workspace detail |

| `create(dto)` | `POST /workspaces` | Criar workspace || `create(dto)` | `POST /workspaces` | Create workspace |

| `update(id, dto)` | `PUT /workspaces/{id}` | Atualizar workspace || `update(id, dto)` | `PUT /workspaces/{id}` | Update workspace |

| `delete(id)` | `DELETE /workspaces/{id}` | Excluir workspace || `delete(id)` | `DELETE /workspaces/{id}` | Delete workspace |

| `getMembers(id)` | `GET /workspaces/{id}/members` | Listar membros do workspace || `getMembers(id)` | `GET /workspaces/{id}/members` | List workspace members |

| `inviteMember(id, dto)` | `POST /workspaces/{id}/members` | Convidar membro || `inviteMember(id, dto)` | `POST /workspaces/{id}/members` | Invite member |

| `removeMember(id, userId)` | `DELETE /workspaces/{id}/members/{userId}` | Remover membro || `removeMember(id, userId)` | `DELETE /workspaces/{id}/members/{userId}` | Remove member |

**Signals:\*\***Signals:\*\*

- `workspaces: Signal<WorkspaceResponse[]>` — todos os workspaces- `workspaces: Signal<WorkspaceResponse[]>` — all workspaces

- `workspacesLoading: Signal<boolean>`- `workspacesLoading: Signal<boolean>`

- `activeWorkspace: Signal<WorkspaceDetail | null>` — workspace visualizado atualmente- `activeWorkspace: Signal<WorkspaceDetail | null>` — currently viewed workspace

- `activeWorkspaceId: Signal<string | null>` — persistido no localStorage- `activeWorkspaceId: Signal<string | null>` — persisted to localStorage

- `hasWorkspaces: Signal<boolean>`- `hasWorkspaces: Signal<boolean>`

#### `BoardService`#### `BoardService`

Gerencia boards, listas e cards com atualizações de estado aninhado.Manages boards, lists, and cards with nested state updates.

| Método | Chamada à API | Descrição || Method | API Call | Description |

| ------------------------------------------ | ----------------------------------------- | ------------------------------------ || ------------------------------------------ | ----------------------------------------- | ----------------------------- |

| `loadAll(workspaceId)` | `GET /boards?workspaceId={id}` | Carregar boards do workspace || `loadAll(workspaceId)` | `GET /boards?workspaceId={id}` | Load boards for workspace |

| `openBoard(id)` | `GET /boards/{id}` | Carregar board com listas + cards || `openBoard(id)` | `GET /boards/{id}` | Load board with lists + cards |

| `create(workspaceId, dto)` | `POST /boards?workspaceId={id}` | Criar board || `create(workspaceId, dto)` | `POST /boards?workspaceId={id}` | Create board |

| `update(id, dto)` | `PUT /boards/{id}` | Atualizar board || `update(id, dto)` | `PUT /boards/{id}` | Update board |

| `delete(id)` | `DELETE /boards/{id}` | Excluir board || `delete(id)` | `DELETE /boards/{id}` | Delete board |

| `addList(boardId, dto)` | `POST /boards/{boardId}/lists` | Criar lista || `addList(boardId, dto)` | `POST /boards/{boardId}/lists` | Create list |

| `updateList(boardId, listId, dto)` | `PUT /boards/{boardId}/lists/{listId}` | Atualizar lista || `updateList(boardId, listId, dto)` | `PUT /boards/{boardId}/lists/{listId}` | Update list |

| `deleteList(boardId, listId)` | `DELETE /boards/{boardId}/lists/{listId}` | Excluir lista || `deleteList(boardId, listId)` | `DELETE /boards/{boardId}/lists/{listId}` | Delete list |

| `addCard(boardId, listId, dto)` | `POST .../lists/{listId}/cards` | Criar card || `addCard(boardId, listId, dto)` | `POST .../lists/{listId}/cards` | Create card |

| `updateCard(boardId, listId, cardId, dto)` | `PUT .../cards/{cardId}` | Atualizar card || `updateCard(boardId, listId, cardId, dto)` | `PUT .../cards/{cardId}` | Update card |

| `moveCard(boardId, cardId, from, to, pos)` | `PATCH .../cards/{cardId}/move` | Mover card (otimista) || `moveCard(boardId, cardId, from, to, pos)` | `PATCH .../cards/{cardId}/move` | Move card (optimistic) |

| `deleteCard(boardId, listId, cardId)` | `DELETE .../cards/{cardId}` | Excluir card || `deleteCard(boardId, listId, cardId)` | `DELETE .../cards/{cardId}` | Delete card |

| `getBoardMembers(boardId)` | `GET /boards/{id}/members` | Listar membros do board || `getBoardMembers(boardId)` | `GET /boards/{id}/members` | List board members |

| `inviteBoardMember(boardId, dto)` | `POST /boards/{id}/members` | Convidar membro || `inviteBoardMember(boardId, dto)` | `POST /boards/{id}/members` | Invite member |

| `removeBoardMember(boardId, userId)` | `DELETE /boards/{id}/members/{userId}` | Remover membro || `removeBoardMember(boardId, userId)` | `DELETE /boards/{id}/members/{userId}` | Remove member |

**Signals:\*\***Signals:\*\*

- `boards: Signal<BoardResponse[]>`- `boards: Signal<BoardResponse[]>`

- `activeBoard: Signal<BoardDetail | null>` — board com listas e cards embutidos- `activeBoard: Signal<BoardDetail | null>` — board with embedded lists and cards

- `lists: Signal<ListWithCards[]>` — ordenadas por posição- `lists: Signal<ListWithCards[]>` — sorted by position

**Atualizações Otimistas:\*\***Optimistic Updates:\*\*

O método `moveCard()` atualiza o estado local imediatamente antes da resposta da API, proporcionando feedback instantâneo no drag-and-drop.The `moveCard()` method updates local state immediately before the API responds, providing instant drag-and-drop feedback.

#### `ThemeService`#### `ThemeService`

Gerencia tema claro/escuro/sistema com listener de media query `prefers-color-scheme`.Manages light/dark/system theme with `prefers-color-scheme` media query listener.

| Signal | Tipo | Descrição || Signal | Type | Description |

| -------------- | ----------------- | ------------------------------------------ || -------------- | ----------------- | ------------------------------------- |

| `currentTheme` | `Signal<Theme>` | Preferência armazenada (light/dark/system) || `currentTheme` | `Signal<Theme>` | Stored preference (light/dark/system) |

| `isDark` | `Signal<boolean>` | Estado resolvido de modo escuro || `isDark` | `Signal<boolean>` | Resolved dark mode state |

Persistido em `localStorage[THEME]`.Persisted to `localStorage[THEME]`.

### Interceptors HTTP### HTTP Interceptors

#### `authInterceptor`#### `authInterceptor`

1. Anexa `Authorization: Bearer <token>` a toda requisição (exceto rotas de auth)1. Attaches `Authorization: Bearer <token>` to every request (except auth routes)

2. Em `401` → automaticamente chama `POST /auth/refresh` e retenta a requisição original2. On `401` → automatically calls `POST /auth/refresh` and retries the original request

3. No código de erro `EMAIL_NOT_VERIFIED` → redireciona para `/verify-email`3. On `EMAIL_NOT_VERIFIED` error code → redirects to `/verify-email`

4. Se refresh falha → limpa sessão e redireciona para `/login`4. If refresh fails → clears session and redirects to `/login`

#### `errorInterceptor`#### `errorInterceptor`

| Status HTTP | Comportamento || HTTP Status | Behavior |

| ------------- | -------------------------------------------------------------------------------- || ------------- | ----------------------------------------------------------------- |

| `0` | Toast: "Não foi possível conectar ao servidor..." (API offline / sem rede) || `0` | Toast: "Unable to reach the server..." (API offline / no network) |

| `503` / `504` | Toast: "Servidor temporariamente indisponível..." || `503` / `504` | Toast: "Server temporarily unavailable..." |

| `500+` | Toast: "Erro inesperado no servidor..." || `500+` | Toast: "Unexpected server error..." |

| `4xx` | Passado adiante (tratado pelo serviço que fez a chamada) || `4xx` | Passed through (handled by calling service) |

### Constantes### Constants

#### Endpoints da API (`api-endpoints.const.ts`)#### API Endpoints (`api-endpoints.const.ts`)

Todos os endpoints são centralizados e derivados de `environment.apiUrl`:All endpoints are centralized and derived from `environment.apiUrl`:

```

AUTH:       login, register, logout, logout-all, refresh, forgot-password,AUTH:       login, register, logout, logout-all, refresh, forgot-password,

            reset-password, verify-email, resend-verification            reset-password, verify-email, resend-verification

USERS:      me, by-idUSERS:      me, by-id

WORKSPACES: all, by-id, members, memberWORKSPACES: all, by-id, members, member

BOARDS:     all, by-id, members, memberBOARDS:     all, by-id, members, member

LISTS:      all(boardId), by-id(boardId, listId)LISTS:      all(boardId), by-id(boardId, listId)

CARDS:      all(boardId, listId), by-id(..., cardId), move(..., cardId)CARDS:      all(boardId, listId), by-id(..., cardId), move(..., cardId)

```

#### Códigos de Erro (`api-error-codes.const.ts`)#### Error Codes (`api-error-codes.const.ts`)

Mapeia todos os códigos de erro da API como constantes TypeScript:Maps all API error codes as TypeScript constants:

| Categoria | Códigos || Category | Codes |

| -------------- | ------------------------------------------------------------------------------------------------------------- || -------------- | ----------------------------------------------------------------------------------------------------------- |

| Autenticação | `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `EMAIL_NOT_FOUND` || Authentication | `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `EMAIL_NOT_FOUND` |

| Registro | `EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `PASSWORDS_DO_NOT_MATCH` || Registration | `EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `PASSWORDS_DO_NOT_MATCH` |

| Token | `INVALID_TOKEN`, `EXPIRED_TOKEN` || Token | `INVALID_TOKEN`, `EXPIRED_TOKEN` |

| Email | `EMAIL_SEND_ERROR`, `EMAIL_AUTH_ERROR` || Email | `EMAIL_SEND_ERROR`, `EMAIL_AUTH_ERROR` |

| Membros | `USER_NOT_FOUND`, `USER_ALREADY_MEMBER`, `USER_NOT_IN_WORKSPACE`, `MEMBER_NOT_FOUND`, `CANNOT_REMOVE_OWNER` || Members | `USER_NOT_FOUND`, `USER_ALREADY_MEMBER`, `USER_NOT_IN_WORKSPACE`, `MEMBER_NOT_FOUND`, `CANNOT_REMOVE_OWNER` |

| Recursos | `WORKSPACE_NOT_FOUND`, `BOARD_NOT_FOUND`, `LIST_NOT_FOUND`, `CARD_NOT_FOUND` || Resources | `WORKSPACE_NOT_FOUND`, `BOARD_NOT_FOUND`, `LIST_NOT_FOUND`, `CARD_NOT_FOUND` |

| Geral | `FORBIDDEN`, `VALIDATION_ERROR` || General | `FORBIDDEN`, `VALIDATION_ERROR` |

### Interfaces### Interfaces

#### `AsyncState<T>`#### `AsyncState<T>`

Wrapper genérico de estado usado pelos serviços para rastreamento de loading/error:Generic state wrapper used by services for loading/error tracking:

`typescript`typescript

interface AsyncState<T> {interface AsyncState<T> {

data: T; data: T;

loading: boolean; loading: boolean;

error: string | null; error: string | null;

}}

````



#### `ApiError`#### `ApiError`



Resposta de erro padrão da API:Standard error response from the API:



```typescript```typescript

interface ApiError {interface ApiError {

  code?: string;  code?: string;

  message: string;  message: string;

  statusCode: number;  statusCode: number;

  timestamp?: string;  timestamp?: string;

  errors?: { field: string; message: string }[]; // erros de validação  errors?: { field: string; message: string }[]; // validation errors

}}

````

#### `PaginatedResponse<T>`#### `PaginatedResponse<T>`

Usado para endpoints paginados (cards, boards):Used for paginated endpoints (cards, boards):

`typescript`typescript

interface PaginatedResponse<T> {interface PaginatedResponse<T> {

data: T[]; data: T[];

pagination: { pagination: {

    page: number;    page: number;

    pageSize: number;    pageSize: number;

    totalPages: number;    totalPages: number;

    totalItems: number;    totalItems: number;

    hasNext: boolean;    hasNext: boolean;

    hasPrevious: boolean;    hasPrevious: boolean;

}; };

}}

````



------



## Features## Features



### Auth (`features/auth/`)### Auth (`features/auth/`)



| Página                        | Rota               | Descrição                                    || Page                          | Route              | Description                          |

| ----------------------------- | ------------------ | -------------------------------------------- || ----------------------------- | ------------------ | ------------------------------------ |

| `LoginPageComponent`          | `/login`           | Formulário de login com email/username + senha || `LoginPageComponent`          | `/login`           | Email/username + password login form |

| `RegisterPageComponent`       | `/register`        | Formulário com nome, username, email, senha  || `RegisterPageComponent`       | `/register`        | Name, username, email, password form |

| `ForgotPasswordPageComponent` | `/forgot-password` | Input de email → envia link de reset         || `ForgotPasswordPageComponent` | `/forgot-password` | Email input → sends reset link       |

| `ResetPasswordPageComponent`  | `/reset-password`  | Formulário de token + nova senha             || `ResetPasswordPageComponent`  | `/reset-password`  | Token + new password form            |

| `VerifyEmailPageComponent`    | `/verify-email`    | Verificação por token + opção de reenvio     || `VerifyEmailPageComponent`    | `/verify-email`    | Token verification + resend option   |



### Boards (`features/boards/`)### Boards (`features/boards/`)



| Página                      | Rota                     | Descrição                                      || Page                       | Route                    | Description                              |

| --------------------------- | ------------------------ | ---------------------------------------------- || -------------------------- | ------------------------ | ---------------------------------------- |

| `BoardsPageComponent`       | `/u/:username/boards`    | Todos os boards agrupados por seções de workspace || `BoardsPageComponent`      | `/u/:username/boards`    | All boards grouped by workspace sections |

| `BoardDetailPageComponent`  | `/b/:boardId/:boardSlug` | Board Kanban com listas e cards                || `BoardDetailPageComponent` | `/b/:boardId/:boardSlug` | Kanban board with lists and cards        |



### Workspaces (`features/workspaces/`)### Workspaces (`features/workspaces/`)



| Página                          | Rota                        | Descrição                             || Page                            | Route                       | Description                        |

| ------------------------------- | --------------------------- | ------------------------------------- || ------------------------------- | --------------------------- | ---------------------------------- |

| `WorkspaceHomePageComponent`    | `/w/:workspaceSlug/home`    | Boards do workspace                   || `WorkspaceHomePageComponent`    | `/w/:workspaceSlug/home`    | Workspace boards                   |

| `WorkspaceAccountPageComponent` | `/w/:workspaceSlug/account` | Renomear workspace, excluir workspace || `WorkspaceAccountPageComponent` | `/w/:workspaceSlug/account` | Rename workspace, delete workspace |



### Dashboard (`features/dashboard/`)### Dashboard (`features/dashboard/`)



| Página               | Rota | Descrição      || Page                 | Route | Description |

| -------------------- | ---- | -------------- || -------------------- | ----- | ----------- |

| `DashboardComponent` | `/`  | Página inicial || `DashboardComponent` | `/`   | Home page   |



------



## Modelos de Dados## Data Models



### Auth### Auth



```typescript```typescript

interface User {interface User {

  id: string;  id: string;

  name: string;  name: string;

  username: string;  username: string;

  email: string;  email: string;

}}



interface AuthResponse {interface AuthResponse {

  name: string;  name: string;

  accessToken: string;  accessToken: string;

  refreshToken: string;  refreshToken: string;

}}



interface UpdateProfileDto {interface UpdateProfileDto {

  name?: string;  name?: string;

  username?: string;  username?: string;

}}

````

### Workspaces### Workspaces

`typescript`typescript

interface WorkspaceResponse {interface WorkspaceResponse {

id: string; id: string;

name: string; name: string;

boardCount: number; boardCount: number;

createdAt: string; createdAt: string;

updatedAt: string; updatedAt: string;

}}

interface WorkspaceDetail {interface WorkspaceDetail {

id: string; id: string;

name: string; name: string;

boards: BoardResponse[]; boards: BoardResponse[];

createdAt: string; createdAt: string;

updatedAt: string; updatedAt: string;

}}

````



### Boards### Boards



```typescript```typescript

interface BoardResponse {interface BoardResponse {

  id: string;  id: string;

  name: string;  name: string;

  type: 'BOARD';  type: 'BOARD';

  description: string;  description: string;

  ownerId: string;  ownerId: string;

  ownerName: string;  ownerName: string;

  listsCount: number;  listsCount: number;

  createdAt: string;  createdAt: string;

  updatedAt: string;  updatedAt: string;

}}



interface BoardDetail extends Omit<BoardResponse, 'listsCount'> {interface BoardDetail extends Omit<BoardResponse, 'listsCount'> {

  lists: ListWithCards[];  lists: ListWithCards[];

}}

````

### Listas### Lists

`typescript`typescript

interface ListResponse {interface ListResponse {

id: string; id: string;

name: string; name: string;

position: number; position: number;

boardId: string; boardId: string;

}}

interface ListWithCards extends ListResponse {interface ListWithCards extends ListResponse {

cards: CardResponse[]; cards: CardResponse[];

}}

````



### Cards### Cards



```typescript```typescript

type CardStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';type CardStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';



interface CardResponse {interface CardResponse {

  id: string;  id: string;

  name: string;  name: string;

  description: string;  description: string;

  status: CardStatus;  status: CardStatus;

  position: number;  position: number;

  listId: string;  listId: string;

  listName: string;  listName: string;

  createdAt: string;  createdAt: string;

  updatedAt: string;  updatedAt: string;

}}

````

### Membros### Members

`typescript`typescript

type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

interface MemberResponse {interface MemberResponse {

id: string; id: string;

userId: string; userId: string;

name: string; name: string;

username: string; username: string;

email: string; email: string;

role: MemberRole; role: MemberRole;

joinedAt: string; joinedAt: string;

}}

```



------



## Camada Shared## Shared Layer



### Componentes do Design System (`shared/components/`)### Design System Components (`shared/components/`)



44 componentes reutilizáveis de UI construídos com Angular CDK, CVA (class-variance-authority) e Tailwind CSS:44 reusable UI components built with Angular CDK, CVA (class-variance-authority), and Tailwind CSS:



| Categoria      | Componentes                                                                                                    || Category     | Components                                                                                                 |

| -------------- | -------------------------------------------------------------------------------------------------------------- || ------------ | ---------------------------------------------------------------------------------------------------------- |

| Layout         | accordion, breadcrumb, card, divider, layout, resizable, tabs                                                  || Layout       | accordion, breadcrumb, card, divider, layout, resizable, tabs                                              |

| Formulários    | checkbox, combobox, command, form, input, input-group, radio, select, slider, switch, toggle, toggle-group     || Forms        | checkbox, combobox, command, form, input, input-group, radio, select, slider, switch, toggle, toggle-group |

| Feedback       | alert, alert-dialog, dialog, loader, progress-bar, skeleton, toast, tooltip                                    || Feedback     | alert, alert-dialog, dialog, loader, progress-bar, skeleton, toast, tooltip                                |

| Navegação      | button, dropdown, menu, pagination, popover, sheet                                                             || Navigation   | button, dropdown, menu, pagination, popover, sheet                                                         |

| Exibição       | avatar, badge, calendar, date-picker, empty, icon, table                                                       || Data Display | avatar, badge, calendar, date-picker, empty, icon, table                                                   |

| Tema           | theme-toggle                                                                                                   || Theme        | theme-toggle                                                                                               |

| Overlay        | dialog, alert-dialog, popover, sheet (todos usam CDK Overlay + Portal)                                         || Overlay      | dialog, alert-dialog, popover, sheet (all use CDK Overlay + Portal)                                        |



Todos os componentes de overlay (Dialog, Alert Dialog, Popover, Sheet) usam:All overlay components (Dialog, Alert Dialog, Popover, Sheet) use:



- **CDK Overlay** para posicionamento e backdrop- **CDK Overlay** for positioning and backdrop

- **CDK Portal** para renderizar conteúdo no container do overlay- **CDK Portal** for rendering content into the overlay container

- **Transições CSS `data-state`** para animações de abrir/fechar (sem `@angular/animations`)- **CSS `data-state`** transitions for open/close animations (no `@angular/animations`)



### Componentes de UI da Aplicação (`shared/ui/`)### Application UI Components (`shared/ui/`)



| Componente               | Descrição                                                 || Component                | Description                                               |

| ------------------------ | --------------------------------------------------------- || ------------------------ | --------------------------------------------------------- |

| `AppButtonComponent`     | Botão estilizado com estado de loading                    || `AppButtonComponent`     | Styled button with loading state                          |

| `AppInputComponent`      | Input de formulário com label, exibição de erro, binding `[control]` || `AppInputComponent`      | Form input with label, error display, `[control]` binding |

| `AppSelectComponent`     | Dropdown select com form control                          || `AppSelectComponent`     | Select dropdown with form control                         |

| `AppTextareaComponent`   | Textarea com form control                                 || `AppTextareaComponent`   | Textarea with form control                                |

| `AppCheckboxComponent`   | Checkbox com form control                                 || `AppCheckboxComponent`   | Checkbox with form control                                |

| `BoardGridComponent`     | Grid reutilizável de cards de board com skeleton loading  || `BoardGridComponent`     | Reusable board card grid with skeleton loading            |

| `PageContainerComponent` | Wrapper padronizado de página (max-w-228.5, mt-5, mx-auto) || `PageContainerComponent` | Standardized page wrapper (max-w-228.5, mt-5, mx-auto)    |

| `PageHeaderComponent`    | Cabeçalho de página com título + descrição                || `PageHeaderComponent`    | Page title + description header                           |

| `AppCardComponent`       | Wrapper de card                                           || `AppCardComponent`       | Card wrapper                                              |

| `AppBadgeComponent`      | Badge de status                                           || `AppBadgeComponent`      | Status badge                                              |

| `AppFormComponent`       | Wrapper de formulário                                     || `AppFormComponent`       | Form wrapper                                              |



### Funções Utilitárias (`shared/utils/`)### Utility Functions (`shared/utils/`)



| Arquivo            | Exportações                                                                                                       || File               | Exports                                                                                                          |

| ------------------ | ----------------------------------------------------------------------------------------------------------------- || ------------------ | ---------------------------------------------------------------------------------------------------------------- |

| `slug.ts`          | `toSlug()`, `boardsPath()`, `boardPath()`, `workspaceSegment()`, `workspaceHomePath()`, `workspaceAccountPath()` || `slug.ts`          | `toSlug()`, `boardsPath()`, `boardPath()`, `workspaceSegment()`, `workspaceHomePath()`, `workspaceAccountPath()` |

| `merge-classes.ts` | `mergeClasses()` (clsx + tailwind-merge), `transform()`, `generateId()`                                          || `merge-classes.ts` | `mergeClasses()` (clsx + tailwind-merge), `transform()`, `generateId()`                                          |

| `number.ts`        | Utilitários de formatação numérica                                                                                || `number.ts`        | Number formatting utilities                                                                                      |



### Serviços### Services



| Serviço        | Descrição                                                                      || Service        | Description                                                                      |

| -------------- | ------------------------------------------------------------------------------ || -------------- | -------------------------------------------------------------------------------- |

| `ToastService` | Wrapper sobre `ngx-sonner` para notificações toast (`success`, `error`, `info`) || `ToastService` | Wrapper around `ngx-sonner` for toast notifications (`success`, `error`, `info`) |



------



## Gerenciamento de Estado## State Management



A aplicação usa **Angular Signals** para gerenciamento de estado local em vez de NgRx ou outras bibliotecas externas de estado.The application uses **Angular Signals** for local state management instead of NgRx or other external state libraries.



### Padrão### Pattern



```

Service (estado baseado em signals)Service (signal-based state)

├── Signals privados → \_workspaces, \_activeBoard, \_currentUser ├── Private signals → \_workspaces, \_activeBoard, \_currentUser

├── Seletores públicos → signals readonly via computed() expostos aos componentes ├── Public selectors → computed() readonly signals exposed to components

└── Ações → métodos que chamam HTTP + atualizam signals via tap() └── Actions → methods that call HTTP + update signals via tap()

```



### Fluxo de Dados### Data Flow



```

Componente → chama método do serviço (ex: boardService.create())Component → calls service method (e.g. boardService.create())

→ HTTP POST (Observable) → HTTP POST (Observable)

    → tap() atualiza estado local do signal    → tap() updates local signal state

      → signals computed() recomputam automaticamente      → computed() signals automatically recompute

        → template do componente re-renderiza (zoneless)        → component template re-renders (zoneless)

````



### Estado Persistido### Persisted State



| Chave                              | Armazenamento | Serviço          || Key                                | Storage      | Service          |

| ---------------------------------- | ------------- | ---------------- || ---------------------------------- | ------------ | ---------------- |

| `task_manager_access_token`        | localStorage  | AuthService      || `task_manager_access_token`        | localStorage | AuthService      |

| `task_manager_refresh_token`       | localStorage  | AuthService      || `task_manager_refresh_token`       | localStorage | AuthService      |

| `task_manager_active_workspace_id` | localStorage  | WorkspaceService || `task_manager_active_workspace_id` | localStorage | WorkspaceService |

| `taskmanager-theme`                | localStorage  | ThemeService     || `taskmanager-theme`                | localStorage | ThemeService     |



------



## Ambientes## Environments



| Arquivo               | `apiUrl`                | `production` || File                  | `apiUrl`                | `production` |

| --------------------- | ----------------------- | ------------ || --------------------- | ----------------------- | ------------ |

| `environment.ts`      | `http://localhost:8080` | `false`      || `environment.ts`      | `http://localhost:8080` | `false`      |

| `environment.prod.ts` | `http://localhost:8080` | `true`       || `environment.prod.ts` | `http://localhost:8080` | `true`       |



------



## Desenvolvimento## Development



### Pré-requisitos### Prerequisites



- Node.js 20+- Node.js 20+

- npm 10+- npm 10+

- Angular CLI 20+- Angular CLI 20+



### Configuração### Setup



```bash```bash

git clone https://github.com/jonasmessias/task-manager-angular.gitgit clone https://github.com/jonasmessias/task-manager-angular.git

cd task-manager-angularcd task-manager-angular

npm installnpm install

````

### Executar### Run

`bash`bash

ng serve # http://localhost:4200ng serve # http://localhost:4200

````



### Build### Build



```bash```bash

ng build          # build de produção → dist/ng build          # production build → dist/

````

### Testes### Test

`bash`bash

ng test # Karma + Jasmineng test # Karma + Jasmine

```



### Estilo de Código### Code Style



- Prettier (printWidth: 100, singleQuote)- Prettier (printWidth: 100, singleQuote)

- Parser Angular para arquivos HTML- Angular template parser for HTML files



------



## Integração com API## API Integration



O frontend espera a API Task Manager rodando em `http://localhost:8080`.The frontend expects the Task Manager API running at `http://localhost:8080`.



### Endpoints Necessários da API### Required API Endpoints



| Módulo     | Endpoints                                                                                                        || Module     | Endpoints                                                                                                        |

| ---------- | ---------------------------------------------------------------------------------------------------------------- || ---------- | ---------------------------------------------------------------------------------------------------------------- |

| Auth       | register, login, logout, logout-all, refresh, verify-email, resend-verification, forgot-password, reset-password || Auth       | register, login, logout, logout-all, refresh, verify-email, resend-verification, forgot-password, reset-password |

| Users      | GET /users/me, PUT /users/me, DELETE /users/me, GET /users/{id}                                                  || Users      | GET /users/me, PUT /users/me, DELETE /users/me, GET /users/{id}                                                  |

| Workspaces | CRUD + membros (listar, convidar, remover)                                                                       || Workspaces | CRUD + members (list, invite, remove)                                                                            |

| Boards     | CRUD + membros (listar, convidar, remover)                                                                       || Boards     | CRUD + members (list, invite, remove)                                                                            |

| Lists      | CRUD (aninhado em boards)                                                                                        || Lists      | CRUD (nested under boards)                                                                                       |

| Cards      | CRUD + mover (aninhado em boards/lists)                                                                          || Cards      | CRUD + move (nested under boards/lists)                                                                          |



### Headers de Autenticação### Authentication Headers



Todas as requisições protegidas incluem:All protected requests include:



```

Authorization: Bearer <access_token>Authorization: Bearer <access_token>

```



O refresh de token é tratado de forma transparente pelo `authInterceptor`.Token refresh is handled transparently by the `authInterceptor`.



------



_Última atualização: 19 de março de 2026__Last updated: March 19, 2026_

```
