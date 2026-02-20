import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { TaskFiltersComponent } from '../componentes/task-filters/task-filters.component';
import { TaskFormComponent } from '../componentes/task-form/task-form.component';
import { TaskListComponent } from '../componentes/task-list/task-list.component';
import { CreateTaskDto, Task, TaskPriority, TaskStatus, UpdateTaskDto } from '../models/task.model';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    TaskListComponent,
    TaskFiltersComponent,
    TaskFormComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.css'],
})
export class TasksPageComponent implements OnInit {
  private tasksService = inject(TasksService);

  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  isLoading = signal<boolean>(false);
  showForm = signal<boolean>(false);
  selectedTask = signal<Task | null>(null);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.filteredTasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar tasks:', err);
        this.isLoading.set(false);
      },
    });
  }

  onFilterChange(filters: { status?: TaskStatus; priority?: TaskPriority }): void {
    let filtered = this.tasks();

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    this.filteredTasks.set(filtered);
  }

  onTaskCreate(dto: CreateTaskDto): void {
    this.isLoading.set(true);
    this.tasksService.createTask(dto).subscribe({
      next: (newTask) => {
        this.tasks.update((current) => [...current, newTask]);
        this.filteredTasks.update((current) => [...current, newTask]);
        this.isLoading.set(false);
        this.showForm.set(false);
      },
      error: (err) => {
        console.error('Erro ao criar task:', err);
        this.isLoading.set(false);
      },
    });
  }

  onTaskUpdate(update: { id: string; dto: UpdateTaskDto }): void {
    this.isLoading.set(true);
    this.tasksService.updateTask(update.id, update.dto).subscribe({
      next: (updatedTask) => {
        if (updatedTask) {
          this.tasks.update((current) =>
            current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
          );
          this.filteredTasks.update((current) =>
            current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
          );
        }
        this.isLoading.set(false);
        this.selectedTask.set(null);
      },
      error: (err) => {
        console.error('Erro ao atualizar task:', err);
        this.isLoading.set(false);
      },
    });
  }

  onTaskDelete(taskId: string): void {
    if (!confirm('Tem certeza que deseja deletar esta task?')) {
      return;
    }

    this.isLoading.set(true);
    this.tasksService.deleteTask(taskId).subscribe({
      next: (success) => {
        if (success) {
          this.tasks.update((current) => current.filter((task) => task.id !== taskId));
          this.filteredTasks.update((current) => current.filter((task) => task.id !== taskId));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao deletar task:', err);
        this.isLoading.set(false);
      },
    });
  }

  onTaskSelect(task: Task): void {
    this.selectedTask.set(task);
    this.showForm.set(true);
  }

  onNewTask(): void {
    this.selectedTask.set(null);
    this.showForm.set(true);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.selectedTask.set(null);
  }
}
