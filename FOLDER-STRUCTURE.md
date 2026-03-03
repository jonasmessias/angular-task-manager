# 📁 Estrutura de Pastas - Task Manager

Este projeto segue uma arquitetura **feature-based** moderna, separando responsabilidades por módulos funcionais.

---

## 🗂️ Estrutura Completa

```
src/app/
├── core/                          # Singleton services, guards, interceptors (app-wide)
│   ├── constants/                 # Constantes globais
│   │   ├── api-endpoints.const.ts # URLs da API centralizadas
│   │   ├── app-config.const.ts    # Configurações gerais
│   │   └── regex-patterns.const.ts # Padrões de validação
│   ├── enums/                     # Enums compartilhados
│   │   └── storage-keys.enum.ts   # Chaves do localStorage
│   ├── guards/                    # Route guards
│   │   └── auth.guard.ts          # Proteção de rotas autenticadas
│   ├── interceptors/              # HTTP interceptors
│   │   └── auth.interceptor.ts    # Adiciona token JWT nas requests
│   ├── interfaces/                # Interfaces globais
│   │   ├── api-response.interface.ts # Estrutura de resposta da API
│   │   └── pagination.interface.ts   # Paginação
│   └── services/                  # Serviços singleton (app-wide)
│       └── auth.service.ts        # 🔐 Lógica de autenticação global
│
├── features/                      # Módulos funcionais (features isoladas)
│   ├── auth/                      # Feature de autenticação
│   │   ├── components/            # Componentes reutilizáveis da feature
│   │   │   └── login-form/        # Formulário de login (dumb component)
│   │   ├── login-page/            # Página de login (smart component)
│   │   ├── register-page/         # Página de cadastro
│   │   ├── forgot-password-page/  # Página "esqueci minha senha"
│   │   ├── reset-password-page/   # Página de redefinir senha
│   │   └── models/                # Interfaces/tipos específicos de auth
│   │       └── auth.model.ts      # User, LoginDto, RegisterDto, etc
│   │
│   └── dashboard/                 # Feature dashboard (placeholder)
│       └── dashboard.component.ts # Página principal após login
│
├── layouts/                       # Layouts de página (public/private)
│   ├── private-layout/            # Layout para rotas autenticadas
│   │   └── private-layout.component.ts
│   └── sidebar.component.ts       # Sidebar de navegação
│
└── shared/                        # Componentes/utilitários compartilhados
    ├── components/                # Componentes UI reutilizáveis (ZardUI)
    │   ├── button/
    │   ├── card/
    │   ├── input/
    │   └── ... (124 componentes)
    └── utils/                     # Funções utilitárias
        ├── cn.ts                  # Class names merge (Tailwind)
        └── merge-classes.ts
```

---

## 🎯 Conceitos de Arquitetura

### **1. Core Module**

> **Quando usar:** Serviços, guards, interceptors que são usados **globalmente** na aplicação

**Características:**

- ✅ Singleton services (`providedIn: 'root'`)
- ✅ Lógica de negócio transversal (autenticação, HTTP, etc)
- ✅ Constantes e enums globais
- ❌ **NÃO** coloque componentes aqui

**Exemplo:**

```typescript
// ✅ CORRETO: AuthService no core (usado em toda a app)
core / services / auth.service.ts;

// ❌ ERRADO: LoginFormComponent no core (é específico da feature auth)
```

---

### **2. Features Module**

> **Quando usar:** Funcionalidades isoladas com seus próprios componentes, páginas e models

**Estrutura de uma feature:**

```
features/auth/
├── components/      # Componentes reutilizáveis (dumb components)
├── pages/           # Páginas (smart components)
├── models/          # Interfaces/tipos específicos
└── services/        # ❌ NÃO! Use core/services se for global
```

**Exemplo:**

- `features/auth/` → Login, Register, Forgot Password
- `features/tasks/` → CRUD de tarefas (a ser implementado)
- `features/profile/` → Editar perfil do usuário (a ser implementado)

---

### **3. Shared Module**

> **Quando usar:** Componentes UI reutilizáveis (botões, cards, inputs) e utilitários

**Características:**

- ✅ Componentes "burros" (dumb components) sem lógica de negócio
- ✅ Funções utilitárias (formatação, validação, etc)
- ✅ Podem ser usados por **qualquer feature**

**Exemplo:**

```typescript
// ✅ CORRETO: Botão genérico no shared
shared / components / button / button.component.ts;

// ❌ ERRADO: LoginForm no shared (é específico da feature auth)
```

---

### **4. Layouts Module**

> **Quando usar:** Estruturas de página reutilizáveis (header, sidebar, footer)

**Exemplo:**

- `layouts/private-layout/` → Layout para usuários autenticados (com sidebar)
- `layouts/public-layout/` → Layout para páginas públicas (login, register)

---

## 📚 Padrões de Nomenclatura

| Tipo            | Padrão             | Exemplo                     |
| --------------- | ------------------ | --------------------------- |
| **Component**   | `*.component.ts`   | `login-form.component.ts`   |
| **Service**     | `*.service.ts`     | `auth.service.ts`           |
| **Guard**       | `*.guard.ts`       | `auth.guard.ts`             |
| **Interceptor** | `*.interceptor.ts` | `auth.interceptor.ts`       |
| **Interface**   | `*.interface.ts`   | `api-response.interface.ts` |
| **Model**       | `*.model.ts`       | `auth.model.ts`             |
| **Enum**        | `*.enum.ts`        | `storage-keys.enum.ts`      |
| **Const**       | `*.const.ts`       | `api-endpoints.const.ts`    |

---

## 🔄 Fluxo de Dados

### **Autenticação:**

```
1. Usuário preenche login-form.component (dumb)
2. login-page.component recebe dados (smart)
3. Chama core/services/auth.service
4. AuthService faz POST /auth/login
5. Salva token no localStorage
6. auth.guard protege rotas privadas
7. auth.interceptor adiciona token nas requests
```

### **Navegação:**

```
/ → Redireciona para /login (não autenticado)
/ → Redireciona para /dashboard (autenticado)
/login → Página de login (public)
/register → Página de cadastro (public)
/forgot-password → Recuperar senha (public)
/reset-password → Redefinir senha (public)
/dashboard → Área privada (protegida por auth.guard)
```

---

## 🚀 Próximos Passos

### **Implementar Features:**

1. [ ] `features/tasks/` - CRUD de tarefas
2. [ ] `features/profile/` - Editar perfil do usuário
3. [ ] `features/settings/` - Configurações da conta

### **Melhorias:**

1. [ ] Adicionar `GET /user` na API (restaurar sessão)
2. [ ] Implementar refresh token automático
3. [ ] Adicionar loading states globais
4. [ ] Error handling centralizado

---

## 📖 Referências

- [Angular Style Guide](https://angular.dev/style-guide)
- [Feature-Based Architecture](https://angular.io/guide/styleguide#application-structure-and-ngmodules)
- [Smart vs Dumb Components](https://blog.angular-university.io/angular-2-smart-components-vs-presentation-components-whats-the-difference-when-to-use-each-and-why/)

---

**Última atualização:** 2026-03-03
