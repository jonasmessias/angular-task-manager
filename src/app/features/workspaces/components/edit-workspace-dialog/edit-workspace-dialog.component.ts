import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkspaceService } from '@core/services/workspace.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import type { WorkspaceResponse } from '../../models/workspace.model';

@Component({
  selector: 'app-edit-workspace-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppInputComponent, AppButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="flex flex-col gap-4">
      <app-input
        label="Workspace name"
        placeholder="e.g. My Team Workspace"
        [control]="form.controls.name"
      />

      <div class="flex justify-end gap-2 pt-2">
        <app-button variant="outline" (click)="cancel()">Cancel</app-button>
        <app-button type="submit" [loading]="loading()">Save changes</app-button>
      </div>
    </form>
  `,
})
export class EditWorkspaceDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ workspace: WorkspaceResponse }>(Z_MODAL_DATA);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.form.patchValue({ name: this.data.workspace.name });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.workspaceService
      .update(this.data.workspace.id, { name: this.form.value.name! })
      .subscribe({
        next: (updated) => {
          this.loading.set(false);
          this.toast.success('Workspace updated!');
          this.dialogRef?.close(updated);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err?.error?.message ?? 'Failed to update workspace.');
        },
      });
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }
}
