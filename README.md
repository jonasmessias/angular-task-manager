# 📋 Task Manager — Frontend# TaskManager

> Aplicação SPA de gerenciamento de tarefas com boards no estilo Kanban, construída com Angular 20.This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?logo=angular&logoColor=white)## Development server

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)To start a local development server, run:

![License](https://img.shields.io/badge/Licença-MIT-green)

```bash

---ng serve

```

## 📖 Sobre

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

Task Manager é uma aplicação de gerenciamento de projetos com hierarquia **Workspace → Board → List → Card**. Permite autenticação completa (JWT + refresh token), colaboração via membros, e uma interface Kanban com drag-and-drop.

## Code scaffolding

### Principais Funcionalidades

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

- 🔐 **Autenticação completa** — Login, registro, verificação de email, recuperação de senha

- 🏢 **Workspaces** — Organize boards em workspaces separados```bash

- 📋 **Boards Kanban** — Listas e cards com arrastar e soltarng generate component component-name

- 👥 **Membros** — Convide e gerencie membros em workspaces e boards```

- 🌙 **Tema claro/escuro** — Alternância com detecção automática do sistema

- ⚡ **Zoneless** — Sem Zone.js, reatividade 100% via Angular SignalsFor a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

---```bash

ng generate --help

## 🛠️ Stack Tecnológica```

| Tecnologia | Versão | Finalidade |## Building

| ------------------------ | ------ | --------------------------------------- |

| Angular | 20.3 | Framework (zoneless change detection) |To build the project run:

| TypeScript | 5.9 | Linguagem |

| Tailwind CSS | 4.1 | Estilização utilitária |```bash

| Angular CDK | 20.2 | Overlay, Portal, A11y, Drag & Drop |ng build

| RxJS | 7.8 | HTTP reativo e gerenciamento de estado |```

| Lucide Angular | 0.553 | Biblioteca de ícones |

| ngx-sonner | 3.1 | Notificações toast |This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

| class-variance-authority | 0.7 | Sistema de variantes de componentes |

| tailwind-merge | 3.3 | Merge de classes Tailwind sem conflitos |## Running unit tests

| clsx | 2.1 | Utilitário de classes condicionais |

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

---

```bash

## 📁 Estrutura do Projetong test

```

````

src/app/## Running end-to-end tests

├── app.config.ts          # Providers (zoneless, router, HTTP, interceptors)

├── app.routes.ts           # Rotas com guards e lazy loadingFor end-to-end (e2e) testing, run:

├── core/                   # Serviços singleton, guards, interceptors, constantes

│   ├── constants/          # Endpoints da API, códigos de erro, regex```bash

│   ├── enums/              # Chaves do localStorageng e2e

│   ├── guards/             # Guards de rota (auth, guest, redirect)```

│   ├── interceptors/       # Interceptors HTTP (auth, error)

│   ├── interfaces/         # Resposta API, estado assíncrono, paginaçãoAngular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

│   └── services/           # Auth, Board, Workspace, Theme

├── features/               # Módulos de feature (páginas + componentes)## Additional Resources

│   ├── auth/               # Login, Registro, Verificação, Recuperação de senha

│   ├── boards/             # Lista de boards, Detalhe do board (Kanban)For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

│   ├── cards/              # Modelos de cards
│   ├── dashboard/          # Página inicial
│   ├── lists/              # Modelos de listas
│   └── workspaces/         # Home do workspace, Configurações, Membros
├── layouts/                # Layouts de página
│   ├── private/            # Layout autenticado (navbar + sidebar + main)
│   └── public/             # Layout visitante (card centralizado)
└── shared/                 # Código reutilizável entre features
    ├── components/         # Design system (44 componentes)
    ├── services/           # ToastService
    ├── ui/                 # Componentes de UI da aplicação
    └── utils/              # Funções utilitárias (slug, merge-classes)
````

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** 20+
- **npm** 10+
- **Angular CLI** 20+
- **API** Task Manager rodando em `http://localhost:8080`

### Instalação

```bash
# Clone o repositório
git clone https://github.com/jonasmessias/task-manager-angular.git
cd task-manager-angular

# Instale as dependências
npm install
```

### Servidor de Desenvolvimento

```bash
ng serve
```

Acesse `http://localhost:4200`. A aplicação recarrega automaticamente ao modificar arquivos.

### Build de Produção

```bash
ng build
```

Os artefatos serão gerados no diretório `dist/`.

### Testes

```bash
ng test
```

Executa testes unitários com Karma + Jasmine.

---

## 🔗 Rotas

### Rotas Privadas (requer autenticação)

| Rota                        | Componente                      | Descrição                               |
| --------------------------- | ------------------------------- | --------------------------------------- |
| `/`                         | `DashboardComponent`            | Página inicial / Dashboard              |
| `/u/:username/boards`       | `BoardsPageComponent`           | Todos os boards agrupados por workspace |
| `/b/:boardId/:boardSlug`    | `BoardDetailPageComponent`      | Board com listas e cards                |
| `/w/:workspaceSlug/home`    | `WorkspaceHomePageComponent`    | Boards do workspace                     |
| `/w/:workspaceSlug/account` | `WorkspaceAccountPageComponent` | Configurações do workspace              |

### Rotas Públicas (apenas visitantes)

| Rota               | Componente                    | Descrição                |
| ------------------ | ----------------------------- | ------------------------ |
| `/login`           | `LoginPageComponent`          | Formulário de login      |
| `/register`        | `RegisterPageComponent`       | Formulário de registro   |
| `/forgot-password` | `ForgotPasswordPageComponent` | Solicitar reset de senha |
| `/reset-password`  | `ResetPasswordPageComponent`  | Definir nova senha       |
| `/verify-email`    | `VerifyEmailPageComponent`    | Verificação de email     |

---

## 🔌 Integração com API

A aplicação espera a API Task Manager rodando em `http://localhost:8080`.

### Módulos da API

| Módulo     | Endpoints                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Auth       | register, login, logout, logout-all, refresh, verify-email, resend-verification, forgot-password, reset-password |
| Users      | GET /users/me, PUT /users/me, DELETE /users/me, GET /users/{id}                                                  |
| Workspaces | CRUD + membros (listar, convidar, remover)                                                                       |
| Boards     | CRUD + membros (listar, convidar, remover)                                                                       |
| Lists      | CRUD (aninhado em boards)                                                                                        |
| Cards      | CRUD + mover (aninhado em boards/lists)                                                                          |

### Autenticação

Todas as requisições protegidas incluem o header:

```
Authorization: Bearer <access_token>
```

O refresh de token é tratado automaticamente pelo `authInterceptor`.

---

## 📄 Documentação

Para documentação técnica completa (arquitetura, serviços, modelos de dados, design system), consulte o arquivo **[DOCUMENT.md](./DOCUMENT.md)**.

---

## 📝 Licença

Este projeto está sob a licença MIT.
