import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BoardService } from '@core/services/board.service';
import { WorkspaceService } from '@core/services/workspace.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { AppSelectComponent, SelectOption } from '@shared/ui/select/app-select.component';
import { boardPath } from '@shared/utils/slug';

@Component({
  selector: 'app-create-board-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppInputComponent, AppSelectComponent, AppButtonComponent],
  template: `
    <div class="flex flex-col w-[320px]">
      <!-- Header -->
      <div class="flex items-center justify-center h-10 border-b border-border px-3 relative">
        <span class="text-sm font-semibold text-foreground">Create board</span>
        <button
          type="button"
          class="absolute right-2 flex items-center justify-center size-6 rounded
                 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          (click)="closed.emit()"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="flex flex-col gap-4 p-4">
        <app-input
          label="Board title"
          placeholder="e.g. Sprint Board"
          [control]="form.controls.name"
          [required]="true"
        />

        <app-select
          label="Workspace"
          placeholder="Select workspace..."
          [control]="form.controls.workspaceId"
          [options]="workspaceOptions()"
          [required]="true"
        />

        <app-button type="submit" [loading]="loading()" class="w-full"> Create </app-button>
      </form>
    </div>
  `,
})
export class CreateBoardPopoverComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly closed = output<void>();

  readonly loading = signal(false);

  readonly workspaceOptions = signal<SelectOption[]>([]);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    workspaceId: ['', Validators.required],
  });

  ngOnInit(): void {
    const workspaces = this.workspaceService.workspaces();
    this.workspaceOptions.set(workspaces.map((w) => ({ value: w.id, label: w.name })));

    // Pre-select active workspace
    const activeId = this.workspaceService.activeWorkspaceId();
    if (activeId) {
      this.form.controls.workspaceId.setValue(activeId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, workspaceId } = this.form.value;
    this.boardService.create(workspaceId!, { name: name!, description: '' }).subscribe({
      next: (board) => {
        this.loading.set(false);
        this.toast.success(`Board "${board.name}" created!`);
        this.closed.emit();
        this.router.navigate(boardPath(board.id, board.name));
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to create board.');
      },
    });
  }
}
