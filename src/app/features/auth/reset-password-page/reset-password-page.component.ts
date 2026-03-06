import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent } from '../../../shared/ui/button/app-button.component';
import { PageCardComponent } from '../../../shared/ui/card/page-card.component';
import { AppFormComponent } from '../../../shared/ui/form/app-form.component';
import { AppInputComponent } from '../../../shared/ui/input/app-input.component';

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
    <div class="auth-page max-w-md mx-auto mt-24 px-4">
      <app-page-card title="Redefinir Senha">
        @if (!submitted()) {
          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {{ errorMessage() }}
            </div>
          }

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
            <p class="text-green-600 dark:text-green-400 font-medium">Senha redefinida com sucesso!</p>
            <a routerLink="/login">
              <app-button variant="outline" [class]="'w-full'">Ir para o Login</app-button>
            </a>
          </div>
        }
      </app-page-card>
    </div>
  `,
})
export class ResetPasswordPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private token = '';

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    newPassword:        ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
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
      this.errorMessage.set('As senhas não coincidem');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .resetPassword({ token: this.token, newPassword: newPassword!, confirmNewPassword: confirmNewPassword! })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.submitted.set(true);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Token inválido ou expirado');
        },
      });
  }
}
