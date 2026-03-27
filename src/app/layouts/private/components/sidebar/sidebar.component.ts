import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import {
  boardPath,
  boardsPath,
  workspaceAccountPath,
  workspaceHomePath,
  workspaceMembersPath,
} from '@shared/utils/slug';
import type { WorkspaceResponse } from '../../../../features/workspaces/models/workspace.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ZardIconComponent, ZardBadgeComponent],
  template: `
    <aside
      class="flex flex-col w-64 h-full bg-sidebar shrink-0 border-r border-border overflow-y-auto"
    >
      <nav class="flex flex-col h-full">
        <!-- Top links -->
        <div class="flex flex-col gap-0.5 px-3 pt-4 pb-2">
          <a
            routerLink="/"
            routerLinkActive="bg-accent text-accent-foreground font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm
                   text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <z-icon zType="house" class="size-4 shrink-0" />
            Home
          </a>
          <a
            [routerLink]="boardsLink()"
            routerLinkActive="bg-accent text-accent-foreground font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm
                   text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <z-icon zType="layout-dashboard" class="size-4 shrink-0" />
            Boards
          </a>
        </div>

        <!-- Separator -->
        <div class="mx-3 my-1 border-t border-border"></div>

        <!-- Workspaces section -->
        <div class="flex flex-col gap-1 px-3 py-2 flex-1">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2.5 mb-1"
          >
            Workspaces
          </p>

          @if (workspaceService.workspacesLoading()) {
            <div class="flex flex-col gap-1 px-2.5">
              @for (i of [1, 2]; track i) {
                <div class="h-8 rounded bg-muted/60 animate-pulse"></div>
              }
            </div>
          } @else {
            @for (workspace of workspaceService.workspaces(); track workspace.id) {
              <div class="flex flex-col">
                <!-- Workspace header row -->
                <div
                  class="group flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer
                         hover:bg-accent transition-colors"
                  (click)="toggleWorkspace(workspace.id)"
                >
                  <!-- Workspace avatar -->
                  <div
                    class="flex items-center justify-center size-6 rounded text-xs font-bold shrink-0
                           text-primary-foreground bg-primary"
                  >
                    {{ workspace.name[0].toUpperCase() }}
                  </div>

                  <span class="flex-1 text-sm font-medium text-foreground truncate">
                    {{ workspace.name }}
                  </span>

                  @if (isShared(workspace)) {
                    <z-badge zType="secondary" class="text-[9px] px-1.5 py-0">Shared</z-badge>
                  }

                  <!-- Collapse chevron -->
                  <z-icon
                    zType="chevron-down"
                    class="size-3.5 text-muted-foreground shrink-0 transition-transform duration-150"
                    [style.transform]="isExpanded(workspace.id) ? 'rotate(0deg)' : 'rotate(-90deg)'"
                  />
                </div>

                <!-- Workspace children (collapsible) -->
                @if (isExpanded(workspace.id)) {
                  <div class="flex flex-col gap-0.5 ml-3 pl-3 border-l border-border mt-0.5 mb-1">
                    <a
                      [routerLink]="workspaceBoards(workspace)"
                      routerLinkActive="bg-accent text-accent-foreground font-medium"
                      [routerLinkActiveOptions]="{ exact: true }"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm
                             text-muted-foreground hover:bg-accent hover:text-accent-foreground
                             transition-colors"
                    >
                      <z-icon zType="layout-dashboard" class="size-3.5 shrink-0" />
                      Boards
                    </a>
                    <a
                      [routerLink]="workspaceMembers(workspace)"
                      routerLinkActive="bg-accent text-accent-foreground font-medium"
                      [routerLinkActiveOptions]="{ exact: true }"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm
                             text-muted-foreground hover:bg-accent hover:text-accent-foreground
                             transition-colors"
                    >
                      <z-icon zType="users" class="size-3.5 shrink-0" />
                      Members
                    </a>
                    <a
                      [routerLink]="workspaceSettings(workspace)"
                      routerLinkActive="bg-accent text-accent-foreground font-medium"
                      [routerLinkActiveOptions]="{ exact: true }"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm
                             text-muted-foreground hover:bg-accent hover:text-accent-foreground
                             transition-colors"
                    >
                      <z-icon zType="settings" class="size-3.5 shrink-0" />
                      Settings
                    </a>
                  </div>
                }
              </div>
            }

            @if (workspaceService.workspaces().length === 0) {
              <p class="text-xs text-muted-foreground px-2.5 py-1">No workspaces yet.</p>
            }
          }
        </div>
      </nav>
    </aside>
  `,
})
export class AppSidebarComponent {
  protected readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);

  /** Set of expanded workspace IDs */
  private readonly expandedIds = signal<Set<string>>(new Set());

  /** /u/:username/boards */
  readonly boardsLink = computed(() => boardsPath(this.authService.currentUser()?.username ?? ''));

  isExpanded(workspaceId: string): boolean {
    return this.expandedIds().has(workspaceId);
  }

  toggleWorkspace(workspaceId: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(workspaceId)) {
        next.delete(workspaceId);
      } else {
        next.add(workspaceId);
      }
      return next;
    });
  }

  // ── Route helpers ──────────────────────────────────────────────────────────

  workspaceBoards(workspace: WorkspaceResponse): string[] {
    return workspaceHomePath(workspace.id, workspace.name);
  }

  workspaceMembers(workspace: WorkspaceResponse): string[] {
    return workspaceMembersPath(workspace.id, workspace.name);
  }

  workspaceSettings(workspace: WorkspaceResponse): string[] {
    return workspaceAccountPath(workspace.id, workspace.name);
  }

  isShared(workspace: WorkspaceResponse): boolean {
    const userId = this.authService.currentUser()?.id;
    return !!userId && !!workspace.ownerId && workspace.ownerId !== userId;
  }

  boardLink(boardId: string, boardName: string): string[] {
    return boardPath(boardId, boardName);
  }
}
