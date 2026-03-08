import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BoardService } from '@core/services/board.service';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { BoardKanbanComponent } from '../components/board-kanban/board-kanban.component';
import { EditBoardDialogComponent } from '../components/edit-board-dialog/edit-board-dialog.component';
@Component({
  selector: 'app-board-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardIconComponent, AppButtonComponent, PageHeaderComponent, BoardKanbanComponent],
  template: `
    <div class="flex flex-col h-full">
      @if (boardService.activeBoardLoading()) {
        <div class="flex items-center justify-center h-full">
          <div class="flex flex-col items-center gap-3 text-muted-foreground">
            <z-icon zType="loader-circle" class="size-8 animate-spin" />
            <p class="text-sm">Loading board...</p>
          </div>
        </div>
      } @else if (boardService.activeBoardError()) {
        <div class="flex items-center justify-center h-full">
          <div class="flex flex-col items-center gap-3 text-muted-foreground">
            <z-icon zType="circle-x" class="size-8 text-destructive" />
            <p class="text-sm">{{ boardService.activeBoardError() }}</p>
            <app-button variant="outline" (click)="goBack()">Go back</app-button>
          </div>
        </div>
      } @else if (boardService.activeBoard(); as board) {
        <div class="px-6 pt-6 pb-0 shrink-0">
          <app-page-header [title]="board.name" [subtitle]="board.description">
            <app-button variant="ghost" icon="pencil" (click)="openEditBoard()">Edit</app-button>
            <app-button variant="destructive" icon="trash-2" (click)="deleteBoard()"
              >Delete</app-button
            >
          </app-page-header>
        </div>

        <app-board-kanban [boardId]="board.id" />
      }
    </div>
  `,
})
export class BoardDetailPageComponent implements OnInit, OnDestroy {
  protected readonly boardService = inject(BoardService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly alertDialog = inject(ZardAlertDialogService);

  ngOnInit(): void {
    const boardId = this.route.snapshot.paramMap.get('boardId')!;
    this.boardService.openBoard(boardId).subscribe();
  }

  ngOnDestroy(): void {
    this.boardService.closeBoard();
  }

  openEditBoard(): void {
    const board = this.boardService.activeBoard();
    if (!board) return;

    this.dialogService.create({
      zTitle: 'Edit Board',
      zContent: EditBoardDialogComponent,
      zData: { board },
      zWidth: '440px',
      zHideFooter: true,
    });
  }

  deleteBoard(): void {
    const board = this.boardService.activeBoard();
    if (!board) return;

    this.alertDialog.confirm({
      zTitle: 'Delete board',
      zDescription: `Are you sure you want to delete "${board.name}"? All lists and cards will be permanently deleted.`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zOnOk: () => {
        const workspaceId = this.workspaceService.activeWorkspaceId();
        this.boardService.delete(board.id).subscribe({
          next: () => {
            this.toast.success('Board deleted.');
            this.router.navigate(['/']);
          },
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to delete board.'),
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
