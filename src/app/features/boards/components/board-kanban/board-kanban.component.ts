import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { BoardService } from '@core/services/board.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { CreateListDialogComponent } from '../../../lists/components/create-list-dialog/create-list-dialog.component';
import {
  BoardListColumnComponent,
  MoveCardEvent,
} from '../board-list-column/board-list-column.component';

@Component({
  selector: 'app-board-kanban',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, BoardListColumnComponent],
  template: `
    <div class="flex gap-4 p-6 overflow-x-auto h-full items-start">
      @for (list of lists(); track list.id) {
        <app-board-list-column
          [list]="list"
          [boardId]="boardId()"
          (deleteList)="onDeleteList($event)"
          (moveCard)="onMoveCard($event)"
        />
      }

      <div class="shrink-0">
        <app-button
          variant="outline"
          icon="plus"
          class="w-72 border-dashed"
          (click)="openAddList()"
        >
          Add list
        </app-button>
      </div>
    </div>
  `,
})
export class BoardKanbanComponent {
  private readonly boardService = inject(BoardService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly toast = inject(ToastService);

  readonly boardId = input.required<string>();

  readonly lists = computed(() => this.boardService.lists());

  openAddList(): void {
    this.dialogService.create({
      zTitle: 'Add list',
      zContent: CreateListDialogComponent,
      zData: { boardId: this.boardId() },
      zWidth: '400px',
      zHideFooter: true,
    });
  }

  onDeleteList(listId: string): void {
    const list = this.lists().find((l) => l.id === listId);
    if (!list) return;

    this.alertDialog.confirm({
      zTitle: 'Delete list',
      zDescription: `Delete "${list.name}"? All cards in this list will also be deleted.`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zOnOk: () => {
        this.boardService.deleteList(this.boardId(), listId).subscribe({
          next: () => this.toast.success('List deleted.'),
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to delete list.'),
        });
      },
    });
  }

  onMoveCard(event: MoveCardEvent): void {
    this.boardService
      .moveCard(this.boardId(), event.cardId, event.fromListId, event.toListId, event.position)
      .subscribe({
        error: (err) => this.toast.error(err?.error?.message ?? 'Failed to move card.'),
      });
  }
}
