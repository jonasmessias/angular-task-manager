import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardService } from '@core/services/board.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';

@Component({
  selector: 'app-create-list-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppInputComponent, AppButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="flex flex-col gap-4">
      <app-input label="List name" placeholder="e.g. To Do" [control]="form.controls.name" />

      <div class="flex justify-end gap-2 pt-2">
        <app-button variant="outline" (click)="cancel()">Cancel</app-button>
        <app-button type="submit" [loading]="loading()">Add list</app-button>
      </div>
    </form>
  `,
})
export class CreateListDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ boardId: string }>(Z_MODAL_DATA);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.boardService.addList(this.data.boardId, { name: this.form.value.name! }).subscribe({
      next: (list) => {
        this.loading.set(false);
        this.toast.success(`List "${list.name}" added!`);
        this.dialogRef?.close(list);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to add list.');
      },
    });
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }
}
