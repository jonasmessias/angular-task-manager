# 📐 Arquitetura do Projeto - Task Manager Angular

## ✅ Padrão Implementado

Este projeto segue uma arquitetura **Feature-Based** com separação clara entre **Container** e **Presentation Components**.

---

## 📁 Estrutura de Diretórios

```
src/app/
├── tasks/                      # Feature: Tasks
│   ├── tasks-page/            # Container Component (Página Principal)
│   │   ├── tasks-page.component.ts
│   │   ├── tasks-page.component.html
│   │   └── tasks-page.component.css
│   ├── componentes/           # Presentation Components (Filhos)
│   │   ├── task-list/
│   │   ├── task-filters/
│   │   └── task-form/
│   ├── services/              # Lógica de Negócio
│   │   └── tasks.service.ts
│   ├── models/                # Interfaces e Tipos
│   │   └── task.model.ts
│   └── mocks/                 # Dados Fictícios
│       └── tasks.mock.ts
│
├── home/                       # Feature: Home/Dashboard
│   ├── home-page/             # Container Component
│   ├── componentes/           # Presentation Components
│   │   ├── welcome-header/
│   │   ├── stats-cards/
│   │   └── recent-activity/
│   ├── services/
│   │   └── home.service.ts
│   ├── models/
│   │   └── dashboard.model.ts
│   └── mocks/
│       └── dashboard.mock.ts
│
├── auth/                       # Feature: Autenticação
│   ├── login-page/            # Container Component
│   ├── register-page/         # Container Component
│   ├── forgot-password-page/  # Container Component
│   ├── reset-password-page/   # Container Component
│   ├── componentes/           # Presentation Components
│   │   └── login-form/
│   ├── services/
│   │   └── auth.service.ts
│   ├── models/
│   │   └── auth.model.ts
│   └── mocks/
│       └── auth.mock.ts
│
├── guards/                     # Guards Globais
│   └── auth.guard.ts
│
├── interceptors/               # Interceptors Globais
│   └── auth.interceptor.ts
│
├── layout/                     # Componentes de Layout
│   ├── sidebar.component.ts
│   └── private-layout/
│
└── shared/                     # Componentes/Utils Compartilhados
    ├── components/             # Biblioteca de UI (Zard UI)
    └── utils/
```

---

## 🎯 Responsabilidades

### **1. Container Components (Páginas)**

📍 Localização: `[feature]/[feature]-page/`

✅ **Responsabilidades:**

- Controlar o fluxo da tela
- Injetar e chamar services
- Gerenciar estado local (usando `signal()`)
- Preparar dados para componentes filhos
- Receber eventos dos componentes filhos
- Orquestrar comunicação entre componentes

❌ **Não deve:**

- Conter lógica de negócio complexa
- Acessar APIs diretamente (use services)
- Duplicar código dos filhos

**Exemplo:**

```typescript
export class TasksPageComponent implements OnInit {
  private tasksService = inject(TasksService);

  tasks = signal<Task[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.tasksService.getTasks().subscribe({
      next: (tasks) => this.tasks.set(tasks),
    });
  }

  onTaskDelete(id: string): void {
    this.tasksService.deleteTask(id).subscribe();
  }
}
```

---

### **2. Presentation Components (Componentes Filhos)**

📍 Localização: `[feature]/componentes/`

✅ **Responsabilidades:**

- Receber dados via `@Input()`
- Emitir eventos via `@Output()`
- Focar **apenas na exibição**
- Validar formulários (quando aplicável)

❌ **Não deve:**

- Chamar services diretamente
- Gerenciar estado global
- Tomar decisões de negócio

**Exemplo:**

```typescript
export class TaskListComponent {
  @Input({ required: true }) tasks: Task[] = [];
  @Output() taskDelete = new EventEmitter<string>();

  onDelete(id: string): void {
    this.taskDelete.emit(id); // Apenas emite evento
  }
}
```

---

### **3. Services**

📍 Localização: `[feature]/services/`

✅ **Responsabilidades:**

- Consumir APIs (HTTP requests)
- Implementar regras de negócio
- Gerenciar estado compartilhado (BehaviorSubject)
- Transformar dados (DTOs)

❌ **Não deve:**

- Acessar DOM
- Manipular estados visuais
- Conhecer detalhes de componentes

**Exemplo:**

```typescript
@Injectable({ providedIn: 'root' })
export class TasksService {
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks');
  }

  deleteTask(id: string): Observable<boolean> {
    return this.http.delete(`/api/tasks/${id}`);
  }
}
```

---

### **4. Models**

📍 Localização: `[feature]/models/`

✅ **Responsabilidades:**

- Definir interfaces e tipos
- Definir DTOs (Data Transfer Objects)
- Definir Enums

❌ **Proibido:**

- Usar `any` (sempre tipar!)

**Exemplo:**

```typescript
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface CreateTaskDto {
  title: string;
  description: string;
}
```

---

### **5. Mocks**

📍 Localização: `[feature]/mocks/`

✅ **Responsabilidades:**

- Dados fictícios para desenvolvimento
- Dados para testes unitários
- Simular respostas de API

**Exemplo:**

```typescript
export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Task 1', status: TaskStatus.TODO },
  { id: '2', title: 'Task 2', status: TaskStatus.DONE },
];
```

---

## 🔄 Padrões de Comunicação

### **Pai → Filho (Passar Dados)**

```typescript
// Pai (Container)
<app-task-list [tasks]="tasks()" />

// Filho (Presentation)
@Input({ required: true }) tasks: Task[] = [];
```

### **Filho → Pai (Emitir Eventos)**

```typescript
// Filho (Presentation)
@Output() taskDelete = new EventEmitter<string>();
this.taskDelete.emit(taskId);

// Pai (Container)
<app-task-list (taskDelete)="onTaskDelete($event)" />
```

### **Service → Página (Observable)**

```typescript
// Service
getTasks(): Observable<Task[]> {
  return of(mockTasks);
}

// Container
this.tasksService.getTasks().subscribe({
  next: (tasks) => this.tasks.set(tasks)
});
```

---

## 🚀 Benefícios desta Arquitetura

✅ **Separação de Responsabilidades**: Cada arquivo tem um propósito claro
✅ **Reutilização**: Componentes filhos podem ser reutilizados
✅ **Testabilidade**: Services e componentes são fáceis de testar
✅ **Manutenibilidade**: Mudanças são localizadas
✅ **Escalabilidade**: Adicionar features é simples
✅ **Tipagem Forte**: Zero `any`, tudo tipado

---

## 📝 Checklist ao Criar Nova Feature

- [ ] Criar pasta `[feature]/`
- [ ] Criar `[feature]-page/` (Container Component)
- [ ] Criar `componentes/` com componentes filhos
- [ ] Criar `services/` com lógica de negócio
- [ ] Criar `models/` com interfaces e tipos
- [ ] Criar `mocks/` com dados fictícios
- [ ] Adicionar rota em `app.routes.ts`
- [ ] Container usa `@Input` para passar dados aos filhos
- [ ] Filhos usam `@Output` para emitir eventos
- [ ] Services nunca acessam DOM
- [ ] Tudo está **fortemente tipado** (zero `any`)

---

## 🎨 Exemplo Completo de Fluxo

1. **Usuário clica em "Deletar Task"** no componente `TaskListComponent`
2. **Filho emite evento:** `this.taskDelete.emit(taskId)`
3. **Pai recebe evento:** `onTaskDelete(id: string)`
4. **Pai chama service:** `this.tasksService.deleteTask(id)`
5. **Service faz requisição HTTP**
6. **Service retorna Observable**
7. **Pai atualiza estado:** `this.tasks.update(...)`
8. **Angular re-renderiza automaticamente**

---

## 🔗 Convenções de Nomenclatura

| Tipo                   | Convenção           | Exemplo                    |
| ---------------------- | ------------------- | -------------------------- |
| Feature Folder         | `kebab-case`        | `tasks/`, `home/`, `auth/` |
| Container Component    | `[feature]-page`    | `tasks-page.component.ts`  |
| Presentation Component | `descritivo`        | `task-list.component.ts`   |
| Service                | `[feature].service` | `tasks.service.ts`         |
| Model                  | `[feature].model`   | `task.model.ts`            |
| Mock                   | `[feature].mock`    | `tasks.mock.ts`            |

---

**Última atualização:** 13 de novembro de 2025
