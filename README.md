# TaskManager Frontend

Frontend SPA construído com Angular 20 e Tailwind CSS para gerenciamento de tarefas com workspaces, boards, listas e cards — inspirado em ferramentas como o Trello.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Angular CLI](https://angular.dev/) 20+
- [TaskManager API](https://github.com/jonasmessias/task-manager-api) rodando em `http://localhost:8080`

## Primeiros Passos

### 1. Clonar o repositório

```bash
git clone https://github.com/jonasmessias/task-manager-angular.git
cd task-manager-angular
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar ambiente

As variáveis de ambiente estão em `src/environments/`:

| Arquivo               | `apiUrl`                          | Descrição       |
| --------------------- | --------------------------------- | --------------- |
| `environment.ts`      | `http://localhost:8080`           | Desenvolvimento |
| `environment.prod.ts` | `https://api.jonasmessias.dev.br` | Produção        |

### 4. Executar a aplicação

```bash
npm start
```

A aplicação estará disponível em [http://localhost:4200](http://localhost:4200).

## Build

```bash
npm run build
```

Os artefatos serão gerados em `dist/task-manager/`.

Para build de produção:

```bash
npm run build -- --configuration production
```

## Testes

```bash
npm test
```

## Estrutura do Projeto

```
src/app/
├── core/                # Serviços singleton, guards, interceptors, constantes
│   ├── constants/       # Endpoints da API, códigos de erro, regex
│   ├── enums/           # Chaves de armazenamento
│   ├── guards/          # Guards de rota (auth)
│   ├── interceptors/    # Interceptors HTTP (auth, error)
│   ├── interfaces/      # Resposta da API, estado assíncrono, paginação
│   └── services/        # Auth, Board, Card, List, Workspace, Theme
├── features/            # Módulos de feature (lazy loaded)
│   ├── auth/            # Login, registro, recuperação de senha
│   ├── boards/          # CRUD de Boards + membros + capas
│   ├── cards/           # CRUD de Cards + drag-and-drop + anexos
│   ├── dashboard/       # Página principal após login
│   ├── lists/           # CRUD de Listas (colunas)
│   └── workspaces/      # CRUD de Workspaces + membros
├── layouts/             # Layouts (público e privado)
└── shared/              # Componentes UI reutilizáveis e utilitários
```

## Stack Tecnológica

| Tecnologia               | Finalidade                             |
| ------------------------ | -------------------------------------- |
| Angular 20               | Framework (zoneless change detection)  |
| TypeScript 5.9           | Linguagem                              |
| Tailwind CSS 4.1         | Estilização utilitária                 |
| Angular CDK              | Overlay, Portal, A11y, Drag & Drop     |
| RxJS 7.8                 | HTTP reativo e gerenciamento de estado |
| Lucide Angular           | Biblioteca de ícones                   |
| ngx-sonner               | Notificações toast                     |
| class-variance-authority | Sistema de variantes de componentes    |
| tailwind-merge           | Merge de classes Tailwind              |
