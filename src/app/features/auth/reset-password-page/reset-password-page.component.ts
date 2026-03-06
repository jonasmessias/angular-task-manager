import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { PageCardComponent } from '@shared/ui/card/page-card.component';
import { AppFormComponent } from '@shared/ui/form/app-form.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    PageCardComponent,
    AppButtonComponent,
    AppFormComponent,
    AppInputComponent,
  ],
  template: `
    <app-page-card title="Redefinir Senha">
      @if (!submitted()) {
        <app-form (submitted)="onSubmit()">
          <app-input
            label="Nova Senha"
            type="password"
            placeholder="••••••"
            [control]="form.get('newPassword')"
            [required]="true"
          />

          <app-input
            label="Confirmar Nova Senha"
            type="password"
            placeholder="••••••"
            [control]="form.get('confirmNewPassword')"
            [required]="true"
          />

          <app-button type="submit" [loading]="isLoading()" [class]="'w-full'">
            Redefinir Senha
          </app-button>
        </app-form>
      } @else {
        <div class="text-center space-y-4">
          <p class="text-green-600 dark:text-green-400 font-medium">
            Senha redefinida com sucesso!
          </p>
          <a routerLink="/login">
            <app-button variant="outline" [class]="'w-full'">Ir para o Login</app-button>
          </a>
        </div>
      }
    </app-page-card>
  `,
})
export class ResetPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required]],
  });

  constructor() {
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmNewPassword } = this.form.value;

    if (newPassword !== confirmNewPassword) {
      this.toast.error('As senhas não coincidem');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .resetPassword({
        token: this.token,
        newPassword: newPassword!,
        confirmNewPassword: confirmNewPassword!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.submitted.set(true);
          this.toast.success('Senha redefinida com sucesso!');
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.toast.error(err.error?.message ?? 'Token inválido ou expirado');
        },
      });
  }
}
