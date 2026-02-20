import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardButtonComponent } from '../../../shared/components/button/button.component';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../../shared/components/form/form.component';
import { ZardInputDirective } from '../../../shared/components/input/input.directive';
import { CreateTaskDto, Task, TaskPriority, UpdateTaskDto } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;

  @Output() taskCreate = new EventEmitter<CreateTaskDto>();
  @Output() taskUpdate = new EventEmitter<{ id: string; dto: UpdateTaskDto }>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = signal<boolean>(false);
  priorityOptions = Object.values(TaskPriority);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode.set(!!this.task);
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: [this.task?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.task?.description || '', [Validators.required, Validators.minLength(10)]],
      priority: [this.task?.priority || TaskPriority.MEDIUM, Validators.required],
      dueDate: [this.task?.dueDate ? this.formatDateForInput(this.task.dueDate) : ''],
      assignedTo: [this.task?.assignedTo || ''],
      tags: [this.task?.tags?.join(', ') || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const dto: CreateTaskDto | UpdateTaskDto = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
      assignedTo: formValue.assignedTo || undefined,
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()) : undefined,
    };

    if (this.isEditMode() && this.task) {
      this.taskUpdate.emit({ id: this.task.id, dto });
    } else {
      this.taskCreate.emit(dto as CreateTaskDto);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['minlength']) {
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
