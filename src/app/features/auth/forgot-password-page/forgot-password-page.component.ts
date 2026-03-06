import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { PageCardComponent } from '@shared/ui/card/page-card.component';
import { AppFormComponent } from '@shared/ui/form/app-form.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';

@Component({
  selector: 'app-forgot-password-page',
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
    <div class="auth-page max-w-md mx-auto mt-24 px-4">
      <app-page-card title="Recuperar Senha">
        @if (!submitted()) {
          <p class="text-sm text-muted-foreground mb-4">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>

          <app-form (submitted)="onSubmit()">
            <app-input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              [control]="form.get('email')"
              [required]="true"
            />

            <app-button type="submit" [loading]="isLoading()" [class]="'w-full'">
              Enviar Link
            </app-button>
          </app-form>

          <p class="text-center text-sm mt-4">
            <a routerLink="/login" class="text-primary hover:underline">Voltar para Login</a>
          </p>
        } @else {
          <div class="text-center space-y-4">
            <p class="text-green-600 dark:text-green-400 font-medium">Email enviado com sucesso!</p>
            <p class="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <a routerLink="/login">
              <app-button variant="outline" [class]="'w-full'">Voltar para Login</app-button>
            </a>
          </div>
        }
      </app-page-card>
    </div>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.forgotPassword(this.form.value as { email: string }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message ?? 'Falha ao enviar email de recuperação');
      },
    });
  }
}
