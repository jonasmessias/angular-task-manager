import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ZardBadgeComponent } from '../../../shared/components/badge/badge.component';
import { ZardBadgeVariants } from '../../../shared/components/badge/badge.variants';
import { ZardButtonComponent } from '../../../shared/components/button/button.component';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import { Task, TaskStatus, UpdateTaskDto } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, ZardBadgeComponent, ZardButtonComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  @Input({ required: true }) tasks: Task[] = [];

  @Output() taskSelect = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<string>();
  @Output() taskUpdate = new EventEmitter<{ id: string; dto: UpdateTaskDto }>();

  TaskStatus = TaskStatus;

  onSelect(task: Task): void {
    this.taskSelect.emit(task);
  }

  onDelete(taskId: string): void {
    this.taskDelete.emit(taskId);
  }

  onStatusChange(task: Task, newStatus: TaskStatus): void {
    this.taskUpdate.emit({
      id: task.id,
      dto: { status: newStatus },
    });
  }

  getStatusColor(status: TaskStatus): ZardBadgeVariants['zType'] {
    const colors: Record<TaskStatus, ZardBadgeVariants['zType']> = {
      [TaskStatus.TODO]: 'secondary',
      [TaskStatus.IN_PROGRESS]: 'default',
      [TaskStatus.REVIEW]: 'outline',
      [TaskStatus.DONE]: 'destructive',
    };
    return colors[status] || 'default';
  }

  getPriorityColor(priority: string): ZardBadgeVariants['zType'] {
    const colors: Record<string, ZardBadgeVariants['zType']> = {
      LOW: 'secondary',
      MEDIUM: 'default',
      HIGH: 'outline',
      URGENT: 'destructive',
    };
    return colors[priority] || 'default';
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Sem prazo';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
