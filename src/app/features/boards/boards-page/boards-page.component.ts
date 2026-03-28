import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.const';
import { AuthService } from '@core/services/auth.service';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { BoardGridComponent } from '@shared/ui/board-grid/board-grid.component';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';
import { workspaceAccountPath, workspaceHomePath, workspaceMembersPath } from '@shared/utils/slug';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  imports: [ZardIconComponent, PageContainerComponent, BoardGridComponent],
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
          <!-- YOUR WORKSPACES -->
          @if (ownedSections().length > 0) {
            <div class="space-y-8">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Workspaces
              </p>

              @for (section of ownedSections(); track section.workspace.id) {
                <section>
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
                    <div class="flex items-center gap-1">
                      <button
                        (click)="goToBoards(section.workspace)"
                        class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                      >
                        <z-icon zType="layout-dashboard" zSize="sm" />
                        Boards
                      </button>
                      <button
                        (click)="goToMembers(section.workspace)"
                        class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                      >
                        <z-icon zType="users" zSize="sm" />
                        Members
                      </button>
                      <button
                        (click)="goToSettings(section.workspace)"
                        class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                      >
                        <z-icon zType="settings" zSize="sm" />
                        Settings
                      </button>
                    </div>
                  </div>

                  <app-board-grid [boards]="section.boards" [loading]="section.loading" />
                </section>

                @if (!$last) {
                  <div class="border-t border-border"></div>
                }
              }
            </div>
          }

          <!-- GUEST WORKSPACES -->
          @if (guestSections().length > 0) {
            @if (ownedSections().length > 0) {
              <div class="border-t border-border"></div>
            }

            <div class="space-y-8">
              <div class="flex items-center gap-2">
                <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Guest Workspaces
                </p>
                <z-icon zType="info" class="size-3.5 text-muted-foreground" />
              </div>

              @for (section of guestSections(); track section.workspace.id) {
                <section>
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="size-8 rounded flex items-center justify-center bg-indigo-600 text-white font-bold text-sm select-none"
                      >
                        {{ section.workspace.name.charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-semibold text-foreground text-base">
                        {{ section.workspace.name }}
                      </span>
                    </div>
                  </div>

                  <app-board-grid [boards]="section.boards" [loading]="section.loading" />
                </section>

                @if (!$last) {
                  <div class="border-t border-border"></div>
                }
              }
            </div>
          }
        }
      </div>
    </app-page-container>
  `,
})
export class BoardsPageComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly sections = signal<WorkspaceSection[]>([]);

  readonly ownedSections = computed(() => {
    const userId = this.authService.currentUser()?.id;
    return this.sections().filter((s) => s.workspace.ownerId === userId);
  });

  readonly guestSections = computed(() => {
    const userId = this.authService.currentUser()?.id;
    return this.sections().filter((s) => s.workspace.ownerId !== userId);
  });

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

  goToSettings(workspace: WorkspaceResponse): void {
    this.router.navigate(workspaceAccountPath(workspace.id, workspace.name));
  }

  goToBoards(workspace: WorkspaceResponse): void {
    this.router.navigate(workspaceHomePath(workspace.id, workspace.name));
  }

  goToMembers(workspace: WorkspaceResponse): void {
    this.router.navigate(workspaceMembersPath(workspace.id, workspace.name));
  }
}
