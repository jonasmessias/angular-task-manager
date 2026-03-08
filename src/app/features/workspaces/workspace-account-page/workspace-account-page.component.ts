import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';
import { boardsPath } from '@shared/utils/slug';
import type { WorkspaceResponse } from '../models/workspace.model';

@Component({
  selector: 'app-workspace-account-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppInputComponent, AppButtonComponent, PageContainerComponent],
  template: `
    <app-page-container>
      @if (workspace()) {
        <div class="space-y-10">
          <!-- Page header -->
          <div>
            <h1 class="text-2xl font-semibold text-foreground">Workspace Settings</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Manage settings for
              <span class="font-medium text-foreground">{{ workspace()!.name }}</span>
            </p>
          </div>

          <!-- Rename section -->
          <section class="space-y-4">
            <h2 class="text-base font-semibold text-foreground">Rename workspace</h2>
            <form [formGroup]="renameForm" (ngSubmit)="onRename()" class="flex items-end gap-3">
              <div class="flex-1">
                <app-input
                  formControlName="name"
                  label="Workspace name"
                  placeholder="Enter workspace name"
                />
              </div>
              <app-button
                type="submit"
                [loading]="renameLoading()"
                [attr.disabled]="renameForm.invalid || renameLoading() ? true : null"
              >
                Save
              </app-button>
            </form>
          </section>

          <div class="border-t border-border"></div>

          <!-- Danger zone -->
          <section class="space-y-4">
            <h2 class="text-base font-semibold text-destructive">Danger zone</h2>
            <div
              class="rounded-lg border border-destructive/40 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p class="text-sm font-medium text-foreground">Delete this workspace</p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  All boards, lists, and cards inside will be permanently deleted. This cannot be
                  undone.
                </p>
              </div>
              <app-button variant="destructive" (click)="onDelete()"> Delete workspace </app-button>
            </div>
          </section>
        </div>
      } @else {
        <div class="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Workspace not found.
        </div>
      }
    </app-page-container>
  `,
})
export class WorkspaceAccountPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly renameLoading = signal(false);

  readonly workspace = computed<WorkspaceResponse | null>(() => {
    const slug = this.route.snapshot.paramMap.get('workspaceSlug') ?? '';
    // Slug format: <name-slug>-<id>  — id is a UUID (no hyphens in name part of UUID)
    // Find the workspace whose id appears at the end of the slug
    const workspaces = this.workspaceService.workspaces();
    return workspaces.find((w) => slug.endsWith(w.id)) ?? null;
  });

  readonly renameForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  });

  ngOnInit(): void {
    // Ensure workspaces are loaded
    if (!this.workspaceService.hasWorkspaces()) {
      this.workspaceService.loadAll().subscribe(() => this.patchForm());
    } else {
      this.patchForm();
    }
  }

  private patchForm(): void {
    const ws = this.workspace();
    if (ws) {
      this.renameForm.patchValue({ name: ws.name });
    }
  }

  onRename(): void {
    if (this.renameForm.invalid) return;
    const ws = this.workspace();
    if (!ws) return;

    const name = this.renameForm.value.name!.trim();
    this.renameLoading.set(true);

    this.workspaceService.update(ws.id, { name }).subscribe({
      next: (updated) => {
        this.renameLoading.set(false);
        this.toast.success('Workspace renamed.');
        // Navigate to updated slug
        this.router.navigate(['/w', `${this.toSlug(updated.name)}-${updated.id}`, 'account'], {
          replaceUrl: true,
        });
      },
      error: (err) => {
        this.renameLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to rename workspace.');
      },
    });
  }

  onDelete(): void {
    const ws = this.workspace();
    if (!ws) return;

    this.alertDialog.confirm({
      zTitle: 'Delete workspace',
      zDescription: `Delete "${ws.name}"? All boards, lists, and cards inside will be permanently deleted.`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zOnOk: () => {
        this.workspaceService.delete(ws.id).subscribe({
          next: () => {
            this.toast.success('Workspace deleted.');
            const username = this.authService.currentUser()?.username ?? '';
            this.router.navigate(boardsPath(username));
          },
          error: (err) => {
            this.toast.error(err?.error?.message ?? 'Failed to delete workspace.');
          },
        });
      },
    });
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
