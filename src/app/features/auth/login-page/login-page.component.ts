import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { PageCardComponent } from '../../../shared/ui/card/page-card.component';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { LoginDto } from '../models/auth.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoginFormComponent, PageCardComponent],
  template: `
    <div class="auth-page max-w-md mx-auto mt-24">
      <app-page-card title="Login">
        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {{ errorMessage() }}
          </div>
        }

        <app-login-form [isLoading]="isLoading()" (loginSubmit)="onLogin($event)" />

        <div class="mt-4 text-sm text-center text-muted-foreground">
          Não tem uma conta?
          <a routerLink="/register" class="text-primary hover:underline font-medium">Criar conta</a>
        </div>
      </app-page-card>
    </div>
  `,
})
export class LoginPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onLogin(dto: LoginDto): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao fazer login');
      },
    });
  }
}
