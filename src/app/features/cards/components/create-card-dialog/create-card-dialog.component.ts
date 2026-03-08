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
  selector: 'app-create-card-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppInputComponent, AppTextareaComponent, AppButtonComponent],
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

      <div class="flex justify-end gap-2 pt-2">
        <app-button variant="outline" (click)="cancel()">Cancel</app-button>
        <app-button type="submit" [loading]="loading()">Add card</app-button>
      </div>
    </form>
  `,
})
export class CreateCardDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ boardId: string; listId: string; listName?: string }>(
    Z_MODAL_DATA,
  );

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, description } = this.form.value;
    this.boardService
      .addCard(this.data.boardId, this.data.listId, {
        name: name!,
        description: description ?? '',
        status: 'ACTIVE',
      })
      .subscribe({
        next: (card) => {
          this.loading.set(false);
          this.toast.success(`Card "${card.name}" added!`);
          this.dialogRef?.close(card);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err?.error?.message ?? 'Failed to add card.');
        },
      });
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }
}
