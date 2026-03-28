import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardService } from '@core/services/board.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { AppTextareaComponent } from '@shared/ui/textarea/app-textarea.component';
import type { BoardResponse } from '../../models/board.model';

@Component({
  selector: 'app-edit-board-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppInputComponent,
    AppTextareaComponent,
    AppButtonComponent,
    ZardIconComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="flex flex-col gap-4">
      <!-- Cover image -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Cover image</label>
        @if (coverUrl()) {
          <div class="relative group rounded-md overflow-hidden border border-border">
            <img [src]="coverUrl()" alt="Board cover" class="w-full h-28 object-cover" />
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                     transition-opacity flex items-center justify-center gap-2"
            >
              <label
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs
                       font-medium bg-white text-black hover:bg-white/90 cursor-pointer transition-colors"
              >
                <z-icon zType="upload" class="size-3.5" />
                Replace
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="onCoverSelected($event)"
                />
              </label>
              <button
                type="button"
                (click)="onDeleteCover()"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs
                       font-medium bg-destructive text-destructive-foreground
                       hover:bg-destructive/90 transition-colors cursor-pointer"
              >
                <z-icon zType="trash-2" class="size-3.5" />
                Remove
              </button>
            </div>
          </div>
        } @else {
          <label
            class="flex flex-col items-center justify-center h-24 rounded-md border-2
                   border-dashed border-border hover:border-primary/50 hover:bg-accent/50
                   transition-colors cursor-pointer gap-1.5"
          >
            <z-icon zType="image" class="size-6 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">Click to upload a cover</span>
            <input type="file" accept="image/*" class="hidden" (change)="onCoverSelected($event)" />
          </label>
        }
        @if (coverUploading()) {
          <span class="text-xs text-muted-foreground flex items-center gap-1.5">
            <z-icon zType="loader-circle" class="size-3.5 animate-spin" />
            Uploading…
          </span>
        }
      </div>

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
        <app-button type="submit" [loading]="loading()">Save changes</app-button>
      </div>
    </form>
  `,
})
export class EditBoardDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly toast = inject(ToastService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ board: BoardResponse }>(Z_MODAL_DATA);

  readonly loading = signal(false);
  readonly coverUploading = signal(false);
  readonly coverUrl = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.board.name,
      description: this.data.board.description ?? '',
    });
    this.coverUrl.set(this.data.board.coverUrl ?? null);
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image must be smaller than 5 MB.');
      return;
    }

    this.coverUploading.set(true);
    this.boardService.uploadCover(this.data.board.id, file).subscribe({
      next: (updated) => {
        this.coverUploading.set(false);
        this.coverUrl.set(updated.coverUrl);
        this.toast.success('Cover updated!');
      },
      error: (err) => {
        this.coverUploading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to upload cover.');
      },
    });
  }

  onDeleteCover(): void {
    this.alertDialog.confirm({
      zTitle: 'Remove cover',
      zDescription: 'Remove the board cover image?',
      zOkText: 'Remove',
      zOkDestructive: true,
      zOnOk: () => {
        this.boardService.deleteCover(this.data.board.id).subscribe({
          next: () => {
            this.coverUrl.set(null);
            this.toast.success('Cover removed.');
          },
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to remove cover.'),
        });
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, description } = this.form.value;
    this.boardService
      .update(this.data.board.id, { name: name!, description: description ?? '' })
      .subscribe({
        next: (updated) => {
          this.loading.set(false);
          this.toast.success('Board updated!');
          this.dialogRef?.close(updated);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err?.error?.message ?? 'Failed to update board.');
        },
      });
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }
}
