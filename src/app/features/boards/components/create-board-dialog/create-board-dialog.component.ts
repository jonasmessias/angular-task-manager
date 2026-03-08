import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardService } from '@core/services/board.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { AppTextareaComponent } from '@shared/ui/textarea/app-textarea.component';

@Component({
  selector: 'app-create-board-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppInputComponent, AppTextareaComponent, AppButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="flex flex-col gap-4">
      <app-input
        label="Board name"
        placeholder="e.g. Sprint Board"
        [control]="form.controls.name"
      />
      <app-textarea
        label="Description"
        placeholder="Optional description..."
        [control]="form.controls.description"
      />

      <div class="flex justify-end gap-2 pt-2">
        <app-button variant="outline" (click)="cancel()">Cancel</app-button>
        <app-button type="submit" [loading]="loading()">Create board</app-button>
      </div>
    </form>
  `,
})
export class CreateBoardDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ workspaceId: string }>(Z_MODAL_DATA);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, description } = this.form.value;
    this.boardService
      .create(this.data.workspaceId, { name: name!, description: description ?? '' })
      .subscribe({
        next: (board) => {
          this.loading.set(false);
          this.toast.success(`Board "${board.name}" created!`);
          this.dialogRef?.close(board);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err?.error?.message ?? 'Failed to create board.');
        },
      });
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }
}
