import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '@core/constants/api-endpoints.const';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';
import { boardPath, workspaceAccountPath } from '@shared/utils/slug';
import type { WorkspaceResponse } from '../../workspaces/models/workspace.model';
import type { BoardResponse } from '../models/board.model';

interface WorkspaceSection {
  workspace: WorkspaceResponse;
  boards: BoardResponse[];
  loading: boolean;
}

@Component({
  selector: 'app-boards-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardIconComponent, PageContainerComponent],
  template: `
    <app-page-container>
      <div class="space-y-10">
        @if (loading()) {
          <div class="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Loading boards…
          </div>
        } @else if (sections().length === 0) {
          <div class="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <z-icon zType="layout-dashboard" zSize="xl" />
            <p class="text-sm">No workspaces yet. Create one to get started.</p>
          </div>
        } @else {
          @for (section of sections(); track section.workspace.id) {
            <section>
              <!-- Workspace header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <div
                    class="size-8 rounded flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm select-none"
                  >
                    {{ section.workspace.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-foreground text-base">
                    {{ section.workspace.name }}
                  </span>
                </div>
                <button
                  (click)="goToSettings(section.workspace)"
                  class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                  <z-icon zType="settings" zSize="sm" />
                  Settings
                </button>
              </div>

              <!-- Board grid -->
              @if (section.loading) {
                <div class="flex gap-3">
                  @for (_ of [1, 2, 3]; track $index) {
                    <div class="w-44 h-24 rounded-lg bg-muted animate-pulse"></div>
                  }
                </div>
              } @else if (section.boards.length === 0) {
                <p class="text-sm text-muted-foreground">
                  No boards yet. Use the
                  <span class="font-medium text-foreground">Create</span> button in the navbar to
                  add one.
                </p>
              } @else {
                <div class="flex flex-wrap gap-3">
                  @for (board of section.boards; track board.id) {
                    <button
                      (click)="openBoard(board)"
                      class="w-44 h-24 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-colors text-left px-3 py-2.5 flex flex-col justify-between group"
                    >
                      <span
                        class="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors"
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
            </section>

            @if (!$last) {
              <div class="border-t border-border"></div>
            }
          }
        }
      </div>
    </app-page-container>
  `,
})
export class BoardsPageComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly sections = signal<WorkspaceSection[]>([]);

  ngOnInit(): void {
    this.workspaceService.loadAll().subscribe({
      next: (workspaces) => {
        if (workspaces.length === 0) {
          this.loading.set(false);
          return;
        }

        // Seed sections immediately so loading skeletons show per workspace
        this.sections.set(workspaces.map((w) => ({ workspace: w, boards: [], loading: true })));
        this.loading.set(false);

        // Load boards for all workspaces in parallel
        const requests = workspaces.map((w) => {
          const params = new HttpParams().set('workspaceId', w.id);
          return this.http
            .get<BoardResponse[]>(API_ENDPOINTS.BOARDS.ALL, { params })
            .pipe(catchError(() => of([] as BoardResponse[])));
        });

        forkJoin(requests).subscribe((results) => {
          this.sections.set(
            workspaces.map((w, i) => ({
              workspace: w,
              boards: results[i],
              loading: false,
            })),
          );
        });
      },
      error: () => this.loading.set(false),
    });
  }

  openBoard(board: BoardResponse): void {
    this.router.navigate(boardPath(board.id, board.name));
  }

  goToSettings(workspace: WorkspaceResponse): void {
    this.router.navigate(workspaceAccountPath(workspace.id, workspace.name));
  }
}
