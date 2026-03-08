import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { boardPath } from '@shared/utils/slug';
import type { BoardResponse } from '../../../features/boards/models/board.model';

@Component({
  selector: 'app-board-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardIconComponent],
  template: `
    @if (loading()) {
      <div class="flex gap-3">
        @for (_ of [1, 2, 3]; track $index) {
          <div class="w-44 h-24 rounded-lg bg-muted animate-pulse"></div>
        }
      </div>
    } @else if (boards().length === 0) {
      <p class="text-sm text-muted-foreground">
        No boards yet. Use the
        <span class="font-medium text-foreground">Create</span> button in the navbar to add one.
      </p>
    } @else {
      <div class="flex flex-wrap gap-3">
        @for (board of boards(); track board.id) {
          <button
            (click)="openBoard(board)"
            class="w-44 h-24 rounded-lg bg-card border border-border hover:border-primary/50
                   hover:bg-accent transition-colors text-left px-3 py-2.5 flex flex-col
                   justify-between group"
          >
            <span
              class="font-medium text-sm text-foreground line-clamp-2
                     group-hover:text-primary transition-colors"
            >
              {{ board.name }}
            </span>
            <span class="text-xs text-muted-foreground">
              {{ board.listsCount }} list{{ board.listsCount === 1 ? '' : 's' }}
            </span>
          </button>
        }
      </div>
    }
  `,
})
export class BoardGridComponent {
  readonly boards = input.required<BoardResponse[]>();
  readonly loading = input(false);

  private readonly router = inject(Router);

  openBoard(board: BoardResponse): void {
    this.router.navigate(boardPath(board.id, board.name));
  }
}
