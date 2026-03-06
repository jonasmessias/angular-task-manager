# Padrão de Componentes — Task Manager Angular

> Documento de padronização para uso do ZardUI e criação de componentes customizados.
> Deve ser seguido em todos os módulos e features da aplicação.

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Camada Primitiva — `shared/components/`](#2-camada-primitiva--sharedcomponents)
3. [Camada de Wrappers — `shared/ui/`](#3-camada-de-wrappers--sharedui)
4. [Camada de Feature — `features/<feature>/components/`](#4-camada-de-feature--featuresfeaturecomponents)
5. [Camada de Layout — `layouts/`](#5-camada-de-layout--layouts)
6. [A função `mergeClasses()`](#6-a-função-mergeclasses)
7. [Variantes com CVA](#7-variantes-com-cva)
8. [Componentes de Formulário](#8-componentes-de-formulário)
9. [Signals e Inputs — Padrão Angular 20](#9-signals-e-inputs--padrão-angular-20)
10. [Quando criar um componente novo](#10-quando-criar-um-componente-novo)
11. [Regras e Convenções](#11-regras-e-convenções)

---

## 1. Visão Geral da Arquitetura

Os componentes são organizados em **quatro camadas** com responsabilidades bem definidas:

```
src/app/
├── shared/
│   ├── components/   → Primitivos do ZardUI (não editar, só consumir)
│   ├── ui/           → Wrappers customizados reutilizáveis (compõem components/)
│   └── utils/        → Utilitários: mergeClasses, cn, number
│
├── features/
│   └── <feature>/
│       └── components/  → Componentes específicos da feature (usam ui/ e components/)
│
└── layouts/
    └── private/
        └── components/  → Componentes exclusivos do layout (navbar, sidebar)
```

### Fluxo de dependência

```
features/<feature>/components/
          ↓  usa
shared/ui/
          ↓  usa
shared/components/   ← ZardUI (base)
```

> **Regra de ouro:** nunca pule camadas. Componentes de feature **não montam estrutura visual do zero** — usam `shared/ui/` para isso. Layouts **não importam** de `features/`.

---

## 2. Camada Primitiva — `shared/components/`

### O que é

Contém os primitivos do **ZardUI** — a biblioteca de componentes do projeto. Seguem o padrão de design system com variantes via CVA, `mergeClasses` e `ViewEncapsulation.None`.

### Primitivos disponíveis

| Seletor                                          | Arquivo          | Uso principal                     |
| ------------------------------------------------ | ---------------- | --------------------------------- |
| `button[z-button]`, `z-button`                   | `button/`        | Botões com variantes e loading    |
| `z-card`                                         | `card/`          | Container de conteúdo em destaque |
| `z-badge`                                        | `badge/`         | Indicadores de status/categoria   |
| `z-icon`                                         | `icon/`          | Ícones Lucide via `zType`         |
| `input[z-input]`, `textarea[z-input]`            | `input/`         | Diretiva de input estilizado      |
| `z-form-field`, `z-form-control`, `z-form-label` | `form/`          | Estrutura de formulário acessível |
| `table[z-table]`                                 | `table/`         | Tabela semântica estilizada       |
| `z-select`                                       | `select/`        | Select nativo acessível           |
| `z-dialog`                                       | `dialog/`        | Modal e overlays                  |
| `z-tooltip`                                      | `tooltip/`       | Dica de contexto ao hover         |
| `z-skeleton`                                     | `skeleton/`      | Placeholder de loading            |
| `z-avatar`                                       | `avatar/`        | Imagem de perfil com fallback     |
| `z-tabs`                                         | `tabs/`          | Navegação por abas                |
| `z-pagination`                                   | `pagination/`    | Controles de paginação            |
| `[zDropdown]`                                    | `dropdown/`      | Dropdown via diretiva de trigger  |
| `z-sidebar`                                      | `layout/sidebar` | Sidebar colapsável com grupos     |

### Padrão de implementação ZardUI

Todo primitivo segue esta estrutura:

```typescript
// shared/components/badge/badge.component.ts
@Component({
  selector: 'z-badge',
  exportAs: 'zBadge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // ← sem escopo CSS — classes Tailwind funcionam
  template: `<ng-content />`,
  host: {
    '[class]': 'classes()', // ← classes aplicadas no host element
  },
})
export class ZardBadgeComponent {
  readonly zType = input<ZardBadgeVariants['zType']>('default');
  readonly zShape = input<ZardBadgeVariants['zShape']>('default');
  readonly class = input<ClassValue>(''); // ← sempre exposta para override externo

  protected readonly classes = computed(() =>
    mergeClasses(badgeVariants({ zType: this.zType(), zShape: this.zShape() }), this.class()),
  );
}
```

### Regras para esta camada

- ✅ Sempre expõe `class = input<ClassValue>('')` para override externo
- ✅ Usa `computed()` para calcular classes dinamicamente
- ✅ Usa `ViewEncapsulation.None` — classes Tailwind são aplicadas no host
- ✅ `exportAs` sempre definido para uso como template reference variable
- ❌ Não adicionar lógica de negócio
- ❌ Não conectar a serviços, stores ou estado global
- ❌ Não modificar para atender um único caso de uso específico

---

## 3. Camada de Wrappers — `shared/ui/`

### O que é

Componentes **reutilizáveis em toda a aplicação** que encapsulam primitivos do ZardUI com configurações, padrões visuais e APIs simplificadas do projeto. É a camada do **meio** — entre o genérico e o específico.

### Inventário atual

| Componente             | Usa de `shared/components/` | Propósito                                         |
| ---------------------- | --------------------------- | ------------------------------------------------- |
| `AppButtonComponent`   | `z-button`, `z-icon`        | Botão com `icon` e `loading` simplificados        |
| `PageCardComponent`    | `z-card`                    | Card padronizado com título e descrição de página |
| `StatusBadgeComponent` | `z-badge`                   | Badge com cores semânticas por status/prioridade  |
| `PageHeaderComponent`  | —                           | Cabeçalho de página com título, subtítulo e ações |

### Padrão de wrapper simples

Quando `shared/ui/` apenas configura um primitivo com padrões fixos:

```typescript
// shared/ui/card/page-card.component.ts
@Component({
  selector: 'app-page-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardCardComponent],
  template: `
    <z-card [zTitle]="title()" [zDescription]="description()" class="w-full">
      <ng-content />
    </z-card>
  `,
})
export class PageCardComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
}
```

> O wrapper define os defaults e expõe uma API com semântica do projeto (`title`, `description`) ao invés da API genérica do ZardUI (`zTitle`, `zDescription`).

### Padrão de wrapper com lógica de configuração

Quando o wrapper precisa mapear dados do domínio para classes visuais:

```typescript
// shared/ui/badge/status-badge.component.ts

// Mapa de configuração — toda lógica visual centralizada aqui
const STATUS_CONFIG: Record<TaskStatus, { label: string; class: string }> = {
  todo: { label: 'A fazer', class: 'bg-secondary text-secondary-foreground ...' },
  in_progress: { label: 'Em progresso', class: 'bg-blue-100 text-blue-700 ...' },
  done: { label: 'Concluído', class: 'bg-green-100 text-green-700 ...' },
  cancelled: { label: 'Cancelado', class: 'bg-destructive/10 text-destructive ...' },
};

// Uso:
// <app-status-badge status="in_progress" />
// <app-status-badge priority="high" />
```

### Padrão de wrapper com slot de conteúdo (ng-content)

Quando o wrapper precisa aceitar conteúdo filho variável:

```typescript
// shared/ui/page-header/page-header.component.ts
template: `
  <div class="flex items-start justify-between gap-4 mb-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold ...">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
      }
    </div>

    <!-- Slot para botões de ação — conteúdo projetado pelo pai -->
    <div class="flex items-center gap-2 shrink-0">
      <ng-content />
    </div>
  </div>
`,

// Uso com ação:
// <app-page-header title="Tarefas" subtitle="Gerencie suas tarefas">
//   <app-button icon="plus">Nova Tarefa</app-button>
// </app-page-header>
```

### Regras para esta camada

- ✅ Importa **apenas** de `shared/components/`
- ✅ API em português/semântica do projeto (ex: `title`, `status`, `priority`)
- ✅ Sempre usa `ChangeDetectionStrategy.OnPush`
- ✅ Sempre usa `standalone: true`
- ❌ Não conectar a serviços ou estado
- ❌ Não importar de `features/`
- ❌ Se começar a ter lógica de negócio específica → mover para `features/<feature>/components/`

---

## 4. Camada de Feature — `features/<feature>/components/`

### O que é

Componentes **específicos de um domínio** da aplicação. Podem conter lógica de negócio, injeção de serviços, estado local e chamadas HTTP.

### Estrutura por feature

```
features/
├── tasks/
│   ├── components/
│   │   ├── task-list/
│   │   │   └── task-list.component.ts       → lista de tarefas (usa DataTable)
│   │   ├── task-form/
│   │   │   └── task-form.component.ts       → formulário de criação/edição
│   │   └── task-filters/
│   │       └── task-filters.component.ts    → filtros da listagem
│   ├── models/
│   │   └── task.model.ts
│   ├── services/
│   │   └── tasks.service.ts
│   └── tasks-page/
│       └── tasks-page.component.ts          → página principal (orquestra os components/)
│
└── dashboard/
    ├── components/
    │   └── ...
    └── dashboard.component.ts
```

### Exemplo de uso das camadas

```typescript
// features/tasks/tasks-page/tasks-page.component.ts
@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    PageHeaderComponent, // ← shared/ui/
    PageCardComponent, // ← shared/ui/
    AppButtonComponent, // ← shared/ui/
    TaskListComponent, // ← features/tasks/components/
    TaskFiltersComponent, // ← features/tasks/components/
  ],
  template: `
    <app-page-header title="Tarefas" subtitle="Gerencie suas tarefas">
      <app-button icon="plus" (click)="openCreateModal()">Nova Tarefa</app-button>
    </app-page-header>

    <app-page-card title="Lista">
      <app-task-filters (filterChange)="onFilterChange($event)" />
      <app-task-list [tasks]="tasks()" />
    </app-page-card>
  `,
})
export class TasksPageComponent {
  private taskService = inject(TasksService);
  readonly tasks = this.taskService.tasks;
}
```

### Regras para esta camada

- ✅ Pode injetar serviços (`inject()`)
- ✅ Pode usar estado local (`signal()`)
- ✅ Pode importar de `shared/ui/` e `shared/components/`
- ✅ Pode conter lógica de negócio e formatação de dados
- ❌ Não deve ser importado por outra feature diferente
- ❌ Não deve importar de `layouts/`
- ❌ Se for reutilizado em outra feature → mover para `shared/ui/`

---

## 5. Camada de Layout — `layouts/`

### O que é

Componentes que definem a estrutura visual das páginas. Responsável por compor as "caixas" da tela (topbar, sidebar, área de conteúdo).

### Estrutura atual

```
layouts/
└── private/
    ├── private.layout.ts                    → orquestrador: só imports e template de composição
    └── components/
        ├── navbar/
        │   ├── navbar.component.ts          → header completo, injeta AuthService
        │   └── avatar-menu/
        │       └── avatar-menu.component.ts → menu do avatar com CDK Overlay próprio
        └── sidebar/
            └── sidebar.component.ts         → navegação lateral
```

### Regra de layout

O arquivo de layout deve ser **apenas composição** — sem lógica:

```typescript
// layouts/private/private.layout.ts
@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AppSidebarComponent],
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <app-navbar />
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto bg-background">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class PrivateLayoutComponent {} // ← classe vazia: sem lógica no layout
```

> Sub-componentes do layout (navbar, sidebar) **injetam seus próprios serviços** diretamente — não recebem dados via input do layout pai.

---

## 6. A função `mergeClasses()`

Utilitário central para composição de classes Tailwind. Localizado em `shared/utils/merge-classes.ts`:

```typescript
import { twMerge } from 'tailwind-merge';
import { ClassValue, clsx } from 'clsx';

export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

> Também existe `shared/utils/cn.ts` com a função `cn()` — alias mais curto para o mesmo comportamento. Use `mergeClasses` nos componentes ZardUI e `cn` em contextos mais simples.

| Função         | Papel                                                          |
| -------------- | -------------------------------------------------------------- |
| `clsx`         | Aceita condicionais, arrays e objetos de classes               |
| `twMerge`      | Resolve conflitos entre classes Tailwind (ex: `p-2` vs `p-4`)  |
| `mergeClasses` | Combina os dois — use sempre que mesclar classes com `input()` |

### Uso

```typescript
// Estilo base + variante CVA + override do input class()
protected readonly classes = computed(() =>
  mergeClasses(
    buttonVariants({ zType: this.zType(), zSize: this.zSize() }),  // variante
    this.class()  // override externo via <z-button class="mt-2">
  )
);
```

```html
<!-- Override pontual via class binding -->
<z-badge zType="secondary" class="uppercase tracking-wider"> Rascunho </z-badge>
```

---

## 7. Variantes com CVA

Use `cva` (class-variance-authority) para componentes com múltiplas variantes visuais. **Nunca use ternários inline** para trocar classes de variante.

### Estrutura padrão (arquivo `.variants.ts` separado)

```typescript
// shared/components/badge/badge.variants.ts
import { cva, VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  // classes base — sempre aplicadas
  'inline-flex items-center border text-xs px-2.5 py-0.5 font-semibold transition-colors',
  {
    variants: {
      zType: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      zShape: {
        default: 'rounded-full',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      zType: 'default',
      zShape: 'default',
    },
  },
);

// Exportar o tipo para uso no componente
export type ZardBadgeVariants = VariantProps<typeof badgeVariants>;
```

```typescript
// Uso no componente — input tipado pelo VariantProps
readonly zType = input<ZardBadgeVariants['zType']>('default');
```

### Convenção de nomenclatura de variantes ZardUI

| Prefixo | Uso              | Exemplo                     |
| ------- | ---------------- | --------------------------- |
| `z`     | Inputs do ZardUI | `zType`, `zSize`, `zShape`  |
| sem     | Inputs de `ui/`  | `variant`, `size`, `status` |

### Quando usar CVA vs `mergeClasses` simples

| Situação                                              | Use            |
| ----------------------------------------------------- | -------------- |
| 2+ variantes mutuamente exclusivas (tipo, tamanho...) | `cva`          |
| Estado ativo/inativo simples                          | `[class.x]`    |
| Override pontual de uma classe via `class` input      | `mergeClasses` |
| Componente de design system                           | `cva`          |

---

## 8. Componentes de Formulário

### Primitivos disponíveis em `shared/components/form/`

```typescript
// Estrutura semântica para qualquer campo
<z-form-field>                    // container do campo
  <z-form-label zRequired>        // label com indicador de obrigatório
    Nome
  </z-form-label>
  <z-form-control [errorMessage]="error()">  // wrapper com mensagem de erro
    <input z-input placeholder="Digite..." />
  </z-form-control>
</z-form-field>
```

### A diretiva `z-input`

O input não é um componente — é uma **diretiva** aplicada em elementos nativos:

```html
<!-- Aplicado em input -->
<input z-input type="text" placeholder="Buscar..." />

<!-- Aplicado em textarea -->
<textarea z-input rows="4" placeholder="Descrição..."></textarea>

<!-- Com variantes -->
<input z-input zSize="sm" zStatus="error" />
```

### Integração com Reactive Forms

```typescript
@Component({
  imports: [
    ReactiveFormsModule,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
  ],
  template: `
    <form [formGroup]="form">
      <z-form-field>
        <z-form-label zRequired>Email</z-form-label>
        <z-form-control [errorMessage]="emailError()">
          <input
            z-input
            type="email"
            formControlName="email"
            [zStatus]="emailError() ? 'error' : undefined"
          />
        </z-form-control>
      </z-form-field>
    </form>
  `,
})
export class LoginFormComponent {
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  readonly emailError = computed(() => {
    const ctrl = this.form.get('email');
    if (ctrl?.invalid && ctrl?.touched) return 'Email inválido';
    return '';
  });
}
```

---

## 9. Signals e Inputs — Padrão Angular 20

O projeto usa **Angular 20 com zoneless** (`provideZonelessChangeDetection()`). Todo estado reativo deve usar Signals.

### Padrão de inputs

```typescript
// ✅ Sempre readonly + input()
readonly title = input.required<string>();      // obrigatório
readonly subtitle = input<string>('');          // opcional com default
readonly loading = input(false);               // boolean com default false
readonly variant = input<'default' | 'outline'>('default');

// ✅ Inputs booleanos — suporte a atributo sem valor via transform
readonly zRequired = input(false, { transform }); // aceita [zRequired] e zRequired=""

// ❌ Nunca usar @Input() decorator — API legada
@Input() title: string = '';
```

### Padrão de outputs

```typescript
// ✅ Sempre readonly + output()
readonly logoutEvent = output<void>();
readonly filterChange = output<TaskFilter>();

// Emissão
this.logoutEvent.emit();
this.filterChange.emit({ status: 'done' });

// ❌ Nunca usar @Output() + EventEmitter — API legada
@Output() logoutEvent = new EventEmitter<void>();
```

### Padrão de estado local

```typescript
// ✅ signal() para estado mutável
readonly isOpen = signal(false);
readonly themeSubmenuOpen = signal(false);

// ✅ computed() para derivados — sem lógica em template
readonly userInitial = computed(() =>
  (this.authService.currentUser?.name?.[0] ?? 'U').toUpperCase()
);

// ✅ inject() para dependências — sem constructor
private readonly authService = inject(AuthService);
private readonly overlay = inject(Overlay);
```

### ChangeDetection

```typescript
// ✅ Sempre OnPush em componentes novos
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

---

## 10. Quando criar um componente novo

### Fluxograma de decisão

```
Preciso de um novo componente?
        │
        ▼
Já existe em shared/components/ (ZardUI)?
   ├─ Sim → Usar direto ou criar wrapper em shared/ui/
   └─ Não → Criar em shared/ui/ ou features/<feature>/components/
                              │
                              ▼
               Vai ser usado em mais de uma feature?
                   ├─ Sim → shared/ui/
                   └─ Não → features/<feature>/components/
                                         │
                                         ▼
                              É exclusivo do layout?
                                 └─ Sim → layouts/private/components/
```

### Checklist antes de criar

- [ ] Já existe em `shared/components/` (ZardUI)?
- [ ] Já existe em `shared/ui/`?
- [ ] Posso compor com primitivos existentes ao invés de criar do zero?
- [ ] Se for para `shared/ui/`: não tem lógica de feature específica?
- [ ] Se for para `features/`: não vai ser reutilizado em outra feature?

---

## 11. Regras e Convenções

### Nomenclatura

| Tipo                     | Convenção                 | Exemplo                                   |
| ------------------------ | ------------------------- | ----------------------------------------- |
| Classe de componente     | PascalCase                | `NavbarComponent`, `StatusBadgeComponent` |
| Seletor ZardUI           | `z-kebab-case`            | `z-button`, `z-badge`, `z-form-field`     |
| Seletor de wrapper `ui/` | `app-kebab-case`          | `app-button`, `app-page-header`           |
| Arquivo de componente    | `kebab-case.component.ts` | `status-badge.component.ts`               |
| Arquivo de variantes     | `kebab-case.variants.ts`  | `badge.variants.ts`                       |
| Arquivo de layout        | `kebab-case.layout.ts`    | `private.layout.ts`                       |

### Estrutura de arquivo padrão

```typescript
// 1. Imports Angular/CDK
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

// 2. Imports de terceiros (rxjs, cdk...)
import { Overlay } from '@angular/cdk/overlay';

// 3. Imports internos — shared/components/ (ZardUI)
import { ZardButtonComponent } from '../../components/button/button.component';

// 4. Imports internos — shared/ui/ (se for feature)
import { AppButtonComponent } from '@shared/ui/button/app-button.component';

// 5. Imports de tipos/variantes
import { ZardButtonVariants } from '../../components/button/button.variants';

// 6. Tipos e constantes locais
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

const STATUS_CONFIG = { ... } as const;

// 7. @Component decorator + classe
@Component({ ... })
export class MyComponent {
  // Injeções
  private readonly service = inject(MyService);

  // Inputs
  readonly title = input.required<string>();

  // Outputs
  readonly clicked = output<void>();

  // Estado local
  readonly isOpen = signal(false);

  // Computados
  readonly label = computed(() => ...);

  // Métodos públicos
  toggle(): void { ... }

  // Lifecycle (apenas se necessário)
  ngOnDestroy(): void { ... }
}
```

### Path aliases

Use sempre path aliases — nunca caminhos relativos com `../../`:

```typescript
// ✅ Correto — via tsconfig paths
import { mergeClasses } from '@shared/utils/merge-classes';
import { ZardButtonComponent } from '@shared/components/button/button.component';

// ⚠️ Aceitável dentro da mesma camada
import { AvatarMenuComponent } from './avatar-menu/avatar-menu.component';

// ❌ Evitar para subir muitos níveis
import { AuthService } from '../../../../../core/services/auth.service';
```

> Verifique os aliases disponíveis em `tsconfig.json` (`@shared/*`, etc.).

### CSS — Tokens semânticos

Use sempre CSS variables do tema — nunca valores hardcoded:

```html
<!-- ✅ Tokens semânticos -->
<div class="bg-primary text-primary-foreground">
  <p class="text-muted-foreground"></p>
  <div class="border-border bg-card">
    <span class="text-destructive">
      <!-- ✅ Dark mode via Tailwind dark: -->
      <div class="bg-white dark:bg-zinc-900">
        <!-- ❌ Valores hardcoded quando existe token -->
        <div class="bg-[#ffffff] text-[#000000]"></div></div
    ></span>
  </div>
</div>
```

### `ViewEncapsulation.None` — quando usar

| Situação                                   | ViewEncapsulation |
| ------------------------------------------ | ----------------- |
| Primitivo ZardUI (classes no host element) | `None`            |
| Wrapper `shared/ui/` com template próprio  | Default (omitir)  |
| Componente de feature com template próprio | Default (omitir)  |
| Layout component                           | Default (omitir)  |
