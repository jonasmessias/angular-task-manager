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
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppInputComponent,
    AppButtonComponent,
    PageContainerComponent,
    ZardIconComponent,
  ],
  template: `
    <app-page-container>
      <div class="space-y-10">
        <!-- Page header -->
        <div>
          <h1 class="text-2xl font-semibold text-foreground">Profile</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Manage your personal information and account settings.
          </p>
        </div>

        <!-- Avatar section -->
        <section class="space-y-4">
          <h2 class="text-base font-semibold text-foreground">Avatar</h2>
          <div class="flex items-center gap-5">
            <div class="relative group">
              @if (avatarUrl()) {
                <img
                  [src]="avatarUrl()"
                  alt="Your avatar"
                  class="size-20 rounded-full object-cover border-2 border-border"
                />
              } @else {
                <div
                  class="size-20 rounded-full bg-primary flex items-center justify-center
                         text-primary-foreground text-2xl font-bold border-2 border-border"
                >
                  {{ userInitial() }}
                </div>
              }
              <label
                class="absolute inset-0 flex items-center justify-center rounded-full
                       bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <z-icon zType="camera" class="size-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="onAvatarSelected($event)"
                />
              </label>
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="inline-flex items-center gap-1.5 text-sm font-medium text-foreground
                       hover:text-primary transition-colors cursor-pointer"
              >
                <z-icon zType="upload" class="size-4" />
                Upload new avatar
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="onAvatarSelected($event)"
                />
              </label>
              @if (avatarUrl()) {
                <button
                  (click)="onDeleteAvatar()"
                  class="inline-flex items-center gap-1.5 text-sm text-destructive
                         hover:text-destructive/80 transition-colors cursor-pointer"
                >
                  <z-icon zType="trash-2" class="size-4" />
                  Remove avatar
                </button>
              }
              @if (avatarUploading()) {
                <span class="text-xs text-muted-foreground flex items-center gap-1.5">
                  <z-icon zType="loader-circle" class="size-3.5 animate-spin" />
                  Uploading…
                </span>
              }
            </div>
          </div>
        </section>

        <div class="border-t border-border"></div>

        <!-- Profile info section -->
        <section class="space-y-4">
          <h2 class="text-base font-semibold text-foreground">Personal information</h2>
          <form
            [formGroup]="profileForm"
            (ngSubmit)="onSaveProfile()"
            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <app-input
              label="Name"
              placeholder="Your full name"
              [control]="profileForm.controls.name"
            />
            <app-input
              label="Username"
              placeholder="Your username"
              [control]="profileForm.controls.username"
            />

            <div class="sm:col-span-2 flex justify-end">
              <app-button
                type="submit"
                [loading]="profileSaving()"
                [attr.disabled]="profileForm.invalid || profileForm.pristine ? true : null"
              >
                Save changes
              </app-button>
            </div>
          </form>
        </section>

        <div class="border-t border-border"></div>

        <!-- Email (read-only) -->
        <section class="space-y-4">
          <h2 class="text-base font-semibold text-foreground">Email</h2>
          <div
            class="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/40"
          >
            <z-icon zType="mail" class="size-4 text-muted-foreground" />
            <span class="text-sm text-foreground">{{ email() }}</span>
          </div>
          <p class="text-xs text-muted-foreground">Your email cannot be changed.</p>
        </section>

        <div class="border-t border-border"></div>

        <!-- Danger zone -->
        <section class="space-y-4">
          <h2 class="text-base font-semibold text-destructive">Danger zone</h2>

          <!-- Logout all sessions -->
          <div class="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Log out of all sessions</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                This will log you out of every device and browser where you're signed in.
              </p>
            </div>
            <app-button variant="outline" (click)="onLogoutAll()">Log out all</app-button>
          </div>

          <!-- Delete account -->
          <div
            class="rounded-lg border border-destructive/40 p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p class="text-sm font-medium text-foreground">Delete account</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <app-button variant="destructive" (click)="onDeleteAccount()">
              Delete account
            </app-button>
          </div>
        </section>
      </div>
    </app-page-container>
  `,
})
export class ProfilePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly alertDialog = inject(ZardAlertDialogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly profileSaving = signal(false);
  readonly avatarUploading = signal(false);

  readonly avatarUrl = computed(() => this.authService.currentUser()?.avatarUrl ?? null);
  readonly email = computed(() => this.authService.currentUser()?.email ?? '');
  readonly userInitial = computed(() =>
    (this.authService.currentUser()?.name ?? '?').charAt(0).toUpperCase(),
  );

  readonly profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({ name: user.name, username: user.username });
    }
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.profileSaving.set(true);
    const { name, username } = this.profileForm.value;

    this.authService.updateProfile({ name: name!, username: username! }).subscribe({
      next: () => {
        this.profileSaving.set(false);
        this.profileForm.markAsPristine();
        this.toast.success('Profile updated.');
      },
      error: (err) => {
        this.profileSaving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to update profile.');
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file triggers change
    input.value = '';

    // Basic validation
    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image must be smaller than 5 MB.');
      return;
    }

    this.avatarUploading.set(true);
    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.avatarUploading.set(false);
        this.toast.success('Avatar updated!');
      },
      error: (err) => {
        this.avatarUploading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to upload avatar.');
      },
    });
  }

  onDeleteAvatar(): void {
    this.alertDialog.confirm({
      zTitle: 'Remove avatar',
      zDescription: 'Are you sure you want to remove your avatar?',
      zOkText: 'Remove',
      zOkDestructive: true,
      zOnOk: () => {
        this.authService.deleteAvatar().subscribe({
          next: () => this.toast.success('Avatar removed.'),
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to remove avatar.'),
        });
      },
    });
  }

  onLogoutAll(): void {
    this.alertDialog.confirm({
      zTitle: 'Log out of all sessions',
      zDescription:
        'This will sign you out of every device. You will need to log in again on all devices.',
      zOkText: 'Log out all',
      zOkDestructive: true,
      zOnOk: () => {
        this.authService.logoutAll();
      },
    });
  }

  onDeleteAccount(): void {
    this.alertDialog.confirm({
      zTitle: 'Delete account',
      zDescription:
        'This will permanently delete your account and all associated data (workspaces, boards, cards). This action cannot be undone.',
      zOkText: 'Delete my account',
      zOkDestructive: true,
      zOnOk: () => {
        this.authService.deleteAccount().subscribe({
          next: () => this.toast.success('Account deleted.'),
          error: (err) => this.toast.error(err?.error?.message ?? 'Failed to delete account.'),
        });
      },
    });
  }
}
