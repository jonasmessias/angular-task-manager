import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { BoardService } from '@core/services/board.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import type { MemberResponse } from '../../../workspaces/models/member.model';

@Component({
  selector: 'app-board-members-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppInputComponent,
    AppButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
  ],
  template: `
    <div class="flex flex-col gap-5">
      <!-- Invite section (only for board owner / workspace owner) -->
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-foreground">Invite member</h3>
        <form (submit)="onInvite()" class="flex items-end gap-2">
          <div class="flex-1">
            <app-input
              [control]="inviteForm.controls.emailOrUsername"
              placeholder="Email or username"
            />
          </div>
          <app-button
            type="submit"
            size="sm"
            icon="user-plus"
            [loading]="inviteLoading()"
            [attr.disabled]="inviteForm.invalid || inviteLoading() ? true : null"
          >
            Invite
          </app-button>
        </form>
      </section>

      <!-- Members list -->
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-foreground">
          Board members ({{ members().length }})
        </h3>

        @if (membersLoading()) {
          <div class="flex flex-col gap-2">
            @for (i of [1, 2]; track i) {
              <div class="h-12 rounded-lg bg-muted/60 animate-pulse"></div>
            }
          </div>
        } @else if (members().length === 0) {
          <p class="text-sm text-muted-foreground py-2">No members yet.</p>
        } @else {
          <div class="flex flex-col gap-1 max-h-64 overflow-y-auto">
            @for (member of members(); track member.userId) {
              <div
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border
                       hover:bg-accent/50 transition-colors"
              >
                <!-- Avatar -->
                <div
                  class="flex items-center justify-center size-8 rounded-full bg-primary
                         text-primary-foreground text-xs font-bold shrink-0"
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
                  <p class="text-xs text-muted-foreground truncate">{{ member.email }}</p>
                </div>

                <!-- Remove button -->
                @if (member.role !== 'OWNER' && member.userId !== currentUserId()) {
                  <button
                    (click)="onRemove(member)"
                    class="text-xs text-destructive hover:text-destructive/80
                           transition-colors p-1 rounded hover:bg-destructive/10"
                  >
                    <z-icon zType="x" zSize="sm" />
                  </button>
                }
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class BoardMembersDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly boardService = inject(BoardService);
  private readonly authService = inject(AuthService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly data = inject<{ boardId: string }>(Z_MODAL_DATA);

  readonly members = signal<MemberResponse[]>([]);
  readonly membersLoading = signal(false);
  readonly inviteLoading = signal(false);

  readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? '');

  readonly inviteForm = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadMembers();
  }

  private loadMembers(): void {
    this.membersLoading.set(true);
    this.boardService.getBoardMembers(this.data.boardId).subscribe({
      next: (members) => {
        this.members.set(members);
        this.membersLoading.set(false);
      },
      error: () => {
        this.membersLoading.set(false);
        this.toast.error('Failed to load board members.');
      },
    });
  }

  onInvite(): void {
    if (this.inviteForm.invalid) return;

    const emailOrUsername = this.inviteForm.value.emailOrUsername!.trim();
    this.inviteLoading.set(true);

    this.boardService.inviteBoardMember(this.data.boardId, { emailOrUsername }).subscribe({
      next: (member) => {
        this.inviteLoading.set(false);
        this.members.update((list) => [...list, member]);
        this.inviteForm.reset();
        this.toast.success(`${member.name} has been added!`);
      },
      error: (err) => {
        this.inviteLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to invite member.');
      },
    });
  }

  onRemove(member: MemberResponse): void {
    this.alertDialog.confirm({
      zTitle: 'Remove member',
      zDescription: `Remove "${member.name}" from this board?`,
      zOkText: 'Remove',
      zOkDestructive: true,
      zOnOk: () => {
        this.boardService.removeBoardMember(this.data.boardId, member.userId).subscribe({
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
}
