import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent } from '../../../shared/ui/button/app-button.component';
import { PageCardComponent } from '../../../shared/ui/card/page-card.component';
import { AppFormComponent } from '../../../shared/ui/form/app-form.component';
import { AppInputComponent } from '../../../shared/ui/input/app-input.component';
import { RegisterDto } from '../models/auth.model';

@Component({
  selector: 'app-register-page',
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
      <app-page-card title="Criar Conta">
        @if (errorMessage()) {
          <div class="mb-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {{ errorMessage() }}
          </div>
        }

        <app-form (submitted)="onSubmit()">
          <app-input label="Nome" placeholder="Seu nome" [control]="form.get('name')" [required]="true" />
          <app-input label="Username" placeholder="seu_username" [control]="form.get('username')" [required]="true" />
          <app-input label="Email" type="email" placeholder="seu@email.com" [control]="form.get('email')" [required]="true" />
          <app-input label="Senha" type="password" placeholder="••••••" [control]="form.get('password')" [required]="true" />
          <app-input label="Confirmar Senha" type="password" placeholder="••••••" [control]="form.get('confirmPassword')" [required]="true" />

          <app-button type="submit" [loading]="isLoading()" [class]="'w-full'">
            Criar Conta
          </app-button>
        </app-form>

        <p class="text-center text-sm text-muted-foreground mt-4">
          Já tem uma conta?
          <a routerLink="/login" class="text-primary hover:underline font-medium">Entrar</a>
        </p>
      </app-page-card>
    </div>
  `,
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name:            ['', [Validators.required]],
    username:        ['', [Validators.required]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form.value as RegisterDto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao criar conta');
      },
    });
  }
}
