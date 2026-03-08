import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { API_ENDPOINTS } from '@core/constants/api-endpoints.const';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { BoardGridComponent } from '@shared/ui/board-grid/board-grid.component';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';
import { workspaceAccountPath } from '@shared/utils/slug';
import type { BoardResponse } from '../../boards/models/board.model';

@Component({
  selector: 'app-workspace-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, BoardGridComponent, ZardIconComponent],
  template: `
    <app-page-container>
      @if (workspace()) {
        <div class="space-y-6">
          <!-- Workspace header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="size-10 rounded flex items-center justify-center bg-primary
                       text-primary-foreground font-bold text-base select-none"
              >
                {{ workspace()!.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h1 class="text-xl font-semibold text-foreground">{{ workspace()!.name }}</h1>
                <p class="text-xs text-muted-foreground">
                  {{ boards().length }} board{{ boards().length === 1 ? '' : 's' }}
                </p>
              </div>
            </div>
            <button
              (click)="goToSettings()"
              class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                     transition-colors px-2 py-1 rounded hover:bg-accent"
            >
              <z-icon zType="settings" zSize="sm" />
              Settings
            </button>
          </div>

          <div class="border-t border-border"></div>

          <!-- Board grid -->
          <app-board-grid [boards]="boards()" [loading]="boardsLoading()" />
        </div>
      } @else {
        <div class="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Workspace not found.
        </div>
      }
    </app-page-container>
  `,
})
export class WorkspaceHomePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly http = inject(HttpClient);

  readonly boards = signal<BoardResponse[]>([]);
  readonly boardsLoading = signal(false);

  readonly workspace = computed(() => {
    const slug = this.route.snapshot.paramMap.get('workspaceSlug') ?? '';
    return this.workspaceService.workspaces().find((w) => slug.endsWith(w.id)) ?? null;
  });

  ngOnInit(): void {
    const load = () => {
      const ws = this.workspace();
      if (!ws) return;

      this.boardsLoading.set(true);
      const params = new HttpParams().set('workspaceId', ws.id);
      this.http
        .get<BoardResponse[]>(API_ENDPOINTS.BOARDS.ALL, { params })
        .pipe(catchError(() => of([] as BoardResponse[])))
        .subscribe((boards) => {
          this.boards.set(boards);
          this.boardsLoading.set(false);
        });
    };

    if (!this.workspaceService.hasWorkspaces()) {
      this.workspaceService.loadAll().subscribe(() => load());
    } else {
      load();
    }
  }

  goToSettings(): void {
    const ws = this.workspace();
    if (ws) this.router.navigate(workspaceAccountPath(ws.id, ws.name));
  }
}
