import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent } from '../../../shared/ui/button/app-button.component';
import { PageCardComponent } from '../../../shared/ui/card/page-card.component';
import { AppFormComponent } from '../../../shared/ui/form/app-form.component';
import { AppInputComponent } from '../../../shared/ui/input/app-input.component';

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

          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {{ errorMessage() }}
            </div>
          }

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
              Verifique sua caixa de entrada e siga as instruÃ§Ãµes para redefinir sua senha.
            </p>
            <a routerLink="/login">
              <button z-button zType="outline" class="w-full">Voltar para Login</button>
            </a>
          </div>
        }
      </app-page-card>
    </div>
  `,
})
export class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
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
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.form.value as { email: string }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao enviar email');
      },
    });
  }
}
