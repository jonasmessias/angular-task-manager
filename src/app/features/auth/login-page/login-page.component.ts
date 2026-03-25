import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { API_ERROR_CODES } from '@core/constants/api-error-codes.const';
import { REGEX_PATTERNS } from '@core/constants/regex-patterns.const';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { PageCardComponent } from '@shared/ui/card/page-card.component';
import { GoogleButtonComponent } from '../components/google-button/google-button.component';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { LoginDto } from '../models/auth.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoginFormComponent, PageCardComponent, GoogleButtonComponent],
  template: `
    <app-page-card title="Login">
      <app-login-form [isLoading]="isLoading()" (loginSubmit)="onLogin($event)" />

      <app-google-button [isLoading]="isLoading()" (googleToken)="onGoogleLogin($event)" />

      <div class="mt-4 text-sm text-center text-muted-foreground">
        Não tem uma conta?
        <a routerLink="/register" class="text-primary hover:underline font-medium">Criar conta</a>
      </div>
    </app-page-card>
  `,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);

  onLogin(dto: LoginDto): void {
    this.isLoading.set(true);

    this.authService.login(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Login realizado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const code: string | undefined = err.error?.code;

        if (code === API_ERROR_CODES.EMAIL_NOT_VERIFIED) {
          const isEmail = REGEX_PATTERNS.EMAIL.test(dto.emailOrUsername);
          this.router.navigate(['/verify-email'], {
            queryParams: isEmail ? { email: dto.emailOrUsername } : {},
          });
          return;
        }

        this.toast.error(err.error?.message ?? 'Email/username ou senha inválidos');
      },
    });
  }

  onGoogleLogin(token: string): void {
    this.isLoading.set(true);

    this.authService.googleLogin({ idToken: token }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Login realizado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message ?? 'Falha ao entrar com Google');
      },
    });
  }
}
