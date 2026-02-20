import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardButtonComponent } from '../../../shared/components/button/button.component';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../../shared/components/form/form.component';
import { TaskPriority, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
  ],
  templateUrl: './task-filters.component.html',
  styleUrls: ['./task-filters.component.css'],
})
export class TaskFiltersComponent {
  @Output() filterChange = new EventEmitter<{
    status?: TaskStatus;
    priority?: TaskPriority;
  }>();

  selectedStatus = signal<TaskStatus | undefined>(undefined);
  selectedPriority = signal<TaskPriority | undefined>(undefined);

  statusOptions = Object.values(TaskStatus);
  priorityOptions = Object.values(TaskPriority);

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const status = value ? (value as TaskStatus) : undefined;
    this.selectedStatus.set(status);
    this.emitFilters();
  }

  onPriorityChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const priority = value ? (value as TaskPriority) : undefined;
    this.selectedPriority.set(priority);
    this.emitFilters();
  }

  onClearFilters(): void {
    this.selectedStatus.set(undefined);
    this.selectedPriority.set(undefined);
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filterChange.emit({
      status: this.selectedStatus(),
      priority: this.selectedPriority(),
    });
  }
}
