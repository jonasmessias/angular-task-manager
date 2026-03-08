import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardService } from '@core/services/board.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { AppSelectComponent, SelectOption } from '@shared/ui/select/app-select.component';
import { AppTextareaComponent } from '@shared/ui/textarea/app-textarea.component';
import type { CardResponse, CardStatus } from '../../models/card.model';

@Component({
  selector: 'app-edit-card-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppInputComponent,
    AppTextareaComponent,
    AppSelectComponent,
    AppButtonComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="flex flex-col gap-4">
      <app-input
        label="Card name"
        placeholder="e.g. Implement login page"
        [control]="form.controls.name"
      />
      <app-textarea
        label="Description"
        placeholder="Optional description..."
        [control]="form.controls.description"
      />
      <app-select label="Status" [control]="form.controls.status" [options]="statusOptions" />

      <div class="flex justify-end gap-2 pt-2">
        <app-button variant="outline" (click)="cancel()">Cancel</app-button>
        <app-button type="submit" [loading]="loading()">Save changes</app-button>
      </div>
    </form>
  `,
})
export class EditCardDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ card: CardResponse; boardId: string }>(Z_MODAL_DATA);

  readonly loading = signal(false);

  readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
    status: ['ACTIVE' as CardStatus, Validators.required],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.card.name,
      description: this.data.card.description ?? '',
      status: this.data.card.status,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, description, status } = this.form.value;
    this.boardService
      .updateCard(this.data.boardId, this.data.card.listId, this.data.card.id, {
        name: name!,
        description: description ?? '',
        status: status as CardStatus,
      })
      .subscribe({
        next: (updated) => {
          this.loading.set(false);
          this.toast.success('Card updated!');
          this.dialogRef?.close(updated);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err?.error?.message ?? 'Failed to update card.');
        },
      });
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }
}
