import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { BoardService } from '@core/services/board.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { CreateCardDialogComponent } from '../../../cards/components/create-card-dialog/create-card-dialog.component';
import { EditCardDialogComponent } from '../../../cards/components/edit-card-dialog/edit-card-dialog.component';
import type { CardResponse } from '../../../cards/models/card.model';
import type { ListWithCards } from '../../../lists/models/list.model';

export interface MoveCardEvent {
  cardId: string;
  fromListId: string;
  toListId: string;
  position: number;
}

@Component({
  selector: 'app-board-list-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardIconComponent, ZardBadgeComponent],
  template: `
    <div class="flex flex-col w-72 shrink-0 rounded-lg bg-muted/50 border border-border">
      <!-- Column header -->
      <div class="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-foreground">{{ list().name }}</h3>
          <span
            class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium"
          >
            {{ list().cards.length }}
          </span>
        </div>
        <div class="flex items-center gap-0.5">
          <button
            class="flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Add card"
            (click)="openAddCard()"
          >
            <z-icon zType="plus" class="size-3.5" />
          </button>
          <button
            class="flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
            title="Delete list"
            (click)="deleteList.emit(list().id)"
          >
            <z-icon zType="trash-2" class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Cards -->
      <div
        class="flex flex-col gap-2 p-2 min-h-12 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]"
      >
        @for (card of list().cards; track card.id) {
          <div
            class="group flex flex-col gap-1.5 p-3 rounded-md bg-background border border-border
                   hover:border-ring/40 hover:shadow-sm cursor-pointer transition-all"
            (click)="openEditCard(card)"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-foreground leading-snug line-clamp-2">
                {{ card.name }}
              </p>
              <button
                class="shrink-0 opacity-0 group-hover:opacity-100 flex items-center justify-center
                       size-5 rounded hover:bg-muted text-muted-foreground hover:text-destructive
                       transition-all"
                title="Delete card"
                (click)="$event.stopPropagation(); onDeleteCard(card)"
              >
                <z-icon zType="trash-2" class="size-3" />
              </button>
            </div>

            @if (card.description) {
              <p class="text-xs text-muted-foreground line-clamp-2">{{ card.description }}</p>
            }

            <z-badge
              zType="outline"
              class="self-start text-[10px]"
              [class]="cardStatusClass(card.status)"
            >
              {{ cardStatusLabel(card.status) }}
            </z-badge>
          </div>
        }

        @if (list().cards.length === 0) {
          <div
            class="flex items-center justify-center h-10 rounded-md border border-dashed border-border"
          >
            <p class="text-xs text-muted-foreground">No cards yet</p>
          </div>
        }
      </div>

      <!-- Add card button -->
      <div class="p-2 border-t border-border">
        <button
          class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs
                 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          (click)="openAddCard()"
        >
          <z-icon zType="plus" class="size-3.5" />
          Add card
        </button>
      </div>
    </div>
  `,
})
export class BoardListColumnComponent {
  private readonly dialogService = inject(ZardDialogService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly boardService = inject(BoardService);
  private readonly toast = inject(ToastService);

  readonly list = input.required<ListWithCards>();
  readonly boardId = input.required<string>();

  readonly deleteList = output<string>();
  readonly moveCard = output<MoveCardEvent>();

  readonly cardStatusLabel = (status: CardResponse['status']): string => {
    const map: Record<CardResponse['status'], string> = {
      ACTIVE: 'Active',
      COMPLETED: 'Completed',
      ARCHIVED: 'Archived',
    };
    return map[status] ?? status;
  };

  readonly cardStatusClass = (status: CardResponse['status']): string => {
    const map: Record<CardResponse['status'], string> = {
      ACTIVE: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED:
        'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      ARCHIVED: 'border-transparent bg-muted text-muted-foreground',
    };
    return map[status] ?? '';
  };

  openAddCard(): void {
    this.dialogService.create({
      zTitle: `Add card to "${this.list().name}"`,
      zContent: CreateCardDialogComponent,
      zData: { boardId: this.boardId(), listId: this.list().id, listName: this.list().name },
      zWidth: '480px',
      zHideFooter: true,
    });
  }

  openEditCard(card: CardResponse): void {
    this.dialogService.create({
      zTitle: 'Edit card',
      zContent: EditCardDialogComponent,
      zData: { card, boardId: this.boardId() },
      zWidth: '480px',
      zHideFooter: true,
    });
  }

  onDeleteCard(card: CardResponse): void {
    this.alertDialog.confirm({
      zTitle: 'Delete card',
      zDescription: `Delete "${card.name}"?`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zOnOk: () => {
        this.boardService.deleteCard(this.boardId(), this.list().id, card.id).subscribe({
          next: () => this.toast.success('Card deleted.'),
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to delete card.'),
        });
      },
    });
  }
}
