import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { WorkspaceService } from '@core/services/workspace.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';
import type { MemberResponse } from '../models/member.model';
import type { WorkspaceResponse } from '../models/workspace.model';

@Component({
  selector: 'app-workspace-members-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    AppInputComponent,
    AppButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
  ],
  template: `
    <app-page-container>
      @if (workspace()) {
        <div class="space-y-8">
          <!-- Page header -->
          <div>
            <h1 class="text-2xl font-semibold text-foreground">Members</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Manage members for
              <span class="font-medium text-foreground">{{ workspace()!.name }}</span>
            </p>
          </div>

          <!-- Invite section (only for owner) -->
          @if (isOwner()) {
            <section class="space-y-3">
              <h2 class="text-base font-semibold text-foreground">Invite member</h2>
              <form (submit)="onInvite()" class="flex items-end gap-3">
                <div class="flex-1">
                  <app-input
                    [control]="inviteForm.controls.emailOrUsername"
                    label="Email or username"
                    placeholder="Enter email or username"
                  />
                </div>
                <app-button
                  type="submit"
                  icon="user-plus"
                  [loading]="inviteLoading()"
                  [attr.disabled]="inviteForm.invalid || inviteLoading() ? true : null"
                >
                  Invite
                </app-button>
              </form>
            </section>

            <div class="border-t border-border"></div>
          }

          <!-- Members list -->
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semibold text-foreground">
                Members ({{ members().length }})
              </h2>
            </div>

            @if (membersLoading()) {
              <div class="flex flex-col gap-2">
                @for (i of [1, 2, 3]; track i) {
                  <div class="h-14 rounded-lg bg-muted/60 animate-pulse"></div>
                }
              </div>
            } @else if (members().length === 0) {
              <p class="text-sm text-muted-foreground py-4">No members yet.</p>
            } @else {
              <div class="flex flex-col gap-1">
                @for (member of members(); track member.userId) {
                  <div
                    class="flex items-center gap-3 px-4 py-3 rounded-lg border border-border
                           hover:bg-accent/50 transition-colors"
                  >
                    <!-- Avatar -->
                    <div
                      class="flex items-center justify-center size-9 rounded-full bg-primary
                             text-primary-foreground text-sm font-bold shrink-0"
                    >
                      {{ member.name.charAt(0).toUpperCase() }}
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-medium text-foreground truncate">
                          {{ member.name }}
                        </p>
                        <z-badge
                          [zType]="member.role === 'OWNER' ? 'default' : 'secondary'"
                          class="text-[10px]"
                        >
                          {{ member.role }}
                        </z-badge>
                      </div>
                      <p class="text-xs text-muted-foreground truncate">
                        {{ member.email }}
                      </p>
                    </div>

                    <!-- Actions -->
                    @if (isOwner() && member.role !== 'OWNER') {
                      <button
                        (click)="onRemove(member)"
                        class="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80
                               transition-colors px-2 py-1 rounded hover:bg-destructive/10"
                      >
                        <z-icon zType="user-minus" zSize="sm" />
                        Remove
                      </button>
                    }

                    @if (!isOwner() && member.userId === currentUserId()) {
                      <button
                        (click)="onLeave()"
                        class="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80
                               transition-colors px-2 py-1 rounded hover:bg-destructive/10"
                      >
                        <z-icon zType="log-out" zSize="sm" />
                        Leave
                      </button>
                    }
                  </div>
                }
              </div>
            }
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
export class WorkspaceMembersPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly members = signal<MemberResponse[]>([]);
  readonly membersLoading = signal(false);
  readonly inviteLoading = signal(false);

  readonly workspace = computed<WorkspaceResponse | null>(() => {
    const slug = this.route.snapshot.paramMap.get('workspaceSlug') ?? '';
    return this.workspaceService.workspaces().find((w) => slug.endsWith(w.id)) ?? null;
  });

  readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? '');

  readonly isOwner = computed(() => {
    const ws = this.workspace();
    return ws ? ws.ownerId === this.currentUserId() : false;
  });

  readonly inviteForm = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.workspaceService.hasWorkspaces()) {
      this.workspaceService.loadAll().subscribe(() => this.loadMembers());
    } else {
      this.loadMembers();
    }
  }

  private loadMembers(): void {
    const ws = this.workspace();
    if (!ws) return;

    this.membersLoading.set(true);
    this.workspaceService.getMembers(ws.id).subscribe({
      next: (members) => {
        this.members.set(members);
        this.membersLoading.set(false);
      },
      error: () => {
        this.membersLoading.set(false);
        this.toast.error('Failed to load members.');
      },
    });
  }

  onInvite(): void {
    if (this.inviteForm.invalid) return;
    const ws = this.workspace();
    if (!ws) return;

    const emailOrUsername = this.inviteForm.value.emailOrUsername!.trim();
    this.inviteLoading.set(true);

    this.workspaceService.inviteMember(ws.id, { emailOrUsername }).subscribe({
      next: (member) => {
        this.inviteLoading.set(false);
        this.members.update((list) => [...list, member]);
        this.inviteForm.reset();
        this.toast.success(`${member.name} has been invited!`);
      },
      error: (err) => {
        this.inviteLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to invite member.');
      },
    });
  }

  onRemove(member: MemberResponse): void {
    const ws = this.workspace();
    if (!ws) return;

    this.alertDialog.confirm({
      zTitle: 'Remove member',
      zDescription: `Remove "${member.name}" from this workspace? They will lose access to all boards.`,
      zOkText: 'Remove',
      zOkDestructive: true,
      zOnOk: () => {
        this.workspaceService.removeMember(ws.id, member.userId).subscribe({
          next: () => {
            this.members.update((list) => list.filter((m) => m.userId !== member.userId));
            this.toast.success(`${member.name} has been removed.`);
          },
          error: (err) => {
            this.toast.error(err?.error?.message ?? 'Failed to remove member.');
          },
        });
      },
    });
  }

  onLeave(): void {
    const ws = this.workspace();
    if (!ws) return;
    const userId = this.currentUserId();

    this.alertDialog.confirm({
      zTitle: 'Leave workspace',
      zDescription: `Are you sure you want to leave "${ws.name}"? You will lose access to all boards in this workspace.`,
      zOkText: 'Leave',
      zOkDestructive: true,
      zOnOk: () => {
        this.workspaceService.removeMember(ws.id, userId).subscribe({
          next: () => {
            this.toast.success('You have left the workspace.');
            // Reload workspaces to reflect the change
            this.workspaceService.loadAll().subscribe();
          },
          error: (err) => {
            this.toast.error(err?.error?.message ?? 'Failed to leave workspace.');
          },
        });
      },
    });
  }
}
