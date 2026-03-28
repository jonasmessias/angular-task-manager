import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';

import { BoardService } from '@core/services/board.service';
import { CardService } from '@core/services/card.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { AppSelectComponent, SelectOption } from '@shared/ui/select/app-select.component';
import { AppTextareaComponent } from '@shared/ui/textarea/app-textarea.component';
import type { AttachmentResponse } from '../../models/attachment.model';
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
    ZardIconComponent,
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

      <!-- Attachments section -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-foreground">Attachments</label>
          <label
            class="inline-flex items-center gap-1 text-xs font-medium text-primary
                   hover:text-primary/80 cursor-pointer transition-colors"
          >
            <z-icon zType="paperclip" class="size-3.5" />
            Add file
            <input type="file" class="hidden" (change)="onFileSelected($event)" />
          </label>
        </div>

        @if (attachmentsLoading()) {
          <div class="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <z-icon zType="loader-circle" class="size-3.5 animate-spin" />
            Loading attachments…
          </div>
        } @else if (attachments().length === 0 && !fileUploading()) {
          <div
            class="flex flex-col items-center justify-center py-4 rounded-md border border-dashed
                   border-border text-muted-foreground gap-1"
          >
            <z-icon zType="paperclip" class="size-5" />
            <span class="text-xs">No attachments yet.</span>
          </div>
        } @else {
          <div class="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            @for (att of attachments(); track att.id) {
              <div
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-border
                       bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <z-icon zType="file" class="size-4 text-muted-foreground shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-foreground truncate">{{ att.fileName }}</p>
                  <p class="text-[10px] text-muted-foreground">{{ formatSize(att.fileSize) }}</p>
                </div>
                <a
                  [href]="att.fileUrl"
                  target="_blank"
                  rel="noopener"
                  class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Download"
                >
                  <z-icon zType="download" class="size-3.5" />
                </a>
                <button
                  type="button"
                  (click)="onDeleteAttachment(att)"
                  class="text-muted-foreground hover:text-destructive transition-colors
                         opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                  title="Delete"
                >
                  <z-icon zType="trash-2" class="size-3.5" />
                </button>
              </div>
            }
          </div>
        }

        @if (fileUploading()) {
          <span class="text-xs text-muted-foreground flex items-center gap-1.5">
            <z-icon zType="loader-circle" class="size-3.5 animate-spin" />
            Uploading file…
          </span>
        }
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <app-button variant="outline" (click)="cancel()">Cancel</app-button>
        <app-button type="submit" [loading]="loading()">Save changes</app-button>
      </div>
    </form>
  `,
})
export class EditCardDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly boardService = inject(BoardService);
  private readonly cardService = inject(CardService);
  private readonly toast = inject(ToastService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ card: CardResponse; boardId: string }>(Z_MODAL_DATA);

  readonly loading = signal(false);
  readonly fileUploading = signal(false);
  readonly attachmentsLoading = signal(false);
  readonly attachments = signal<AttachmentResponse[]>([]);

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

    this.loadAttachments();
  }

  private loadAttachments(): void {
    this.attachmentsLoading.set(true);
    this.cardService.getAttachments(this.data.card.id).subscribe({
      next: (list) => {
        this.attachments.set(list);
        this.attachmentsLoading.set(false);
      },
      error: () => {
        this.attachmentsLoading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('File must be smaller than 10 MB.');
      return;
    }

    this.fileUploading.set(true);

    // Step 1: Request presigned upload URL
    this.cardService
      .requestUpload(this.data.card.id, {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
      })
      .pipe(
        // Step 2: Upload file directly to presigned URL
        switchMap((presigned) =>
          this.http
            .put(presigned.uploadUrl, file, {
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
            })
            .pipe(
              // Step 3: Confirm the upload
              switchMap(() =>
                this.cardService.confirmAttachment(this.data.card.id, {
                  fileName: file.name,
                  fileKey: presigned.fileKey,
                  contentType: file.type || 'application/octet-stream',
                  fileSize: file.size,
                }),
              ),
            ),
        ),
      )
      .subscribe({
        next: (attachment) => {
          this.fileUploading.set(false);
          this.attachments.update((list) => [...list, attachment]);
          this.toast.success(`"${attachment.fileName}" attached!`);
        },
        error: (err) => {
          this.fileUploading.set(false);
          this.toast.error(err?.error?.message ?? 'Failed to upload file.');
        },
      });
  }

  onDeleteAttachment(att: AttachmentResponse): void {
    this.alertDialog.confirm({
      zTitle: 'Delete attachment',
      zDescription: `Delete "${att.fileName}"? This cannot be undone.`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zOnOk: () => {
        this.cardService.deleteAttachment(this.data.card.id, att.id).subscribe({
          next: () => {
            this.attachments.update((list) => list.filter((a) => a.id !== att.id));
            this.toast.success('Attachment deleted.');
          },
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to delete attachment.'),
        });
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
