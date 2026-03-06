import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { PageCardComponent } from '@shared/ui/card/page-card.component';
import { AppFormComponent } from '@shared/ui/form/app-form.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
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
    <app-page-card title="Criar Conta">
      <app-form (submitted)="onSubmit()">
        <app-input
          label="Nome"
          placeholder="Seu nome"
          [control]="form.get('name')"
          [required]="true"
        />
        <app-input
          label="Username"
          placeholder="seu_username"
          [control]="form.get('username')"
          [required]="true"
        />
        <app-input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          [control]="form.get('email')"
          [required]="true"
        />
        <app-input
          label="Senha"
          type="password"
          placeholder="••••••"
          [control]="form.get('password')"
          [required]="true"
        />
        <app-input
          label="Confirmar Senha"
          type="password"
          placeholder="••••••"
          [control]="form.get('confirmPassword')"
          [required]="true"
        />

        <app-button type="submit" [loading]="isLoading()" [class]="'w-full'">
          Criar Conta
        </app-button>
      </app-form>

      <p class="text-center text-sm text-muted-foreground mt-4">
        Já tem uma conta?
        <a routerLink="/login" class="text-primary hover:underline font-medium">Entrar</a>
      </p>
    </app-page-card>
  `,
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, username, email, password, confirmPassword } = this.form.value;

    if (password !== confirmPassword) {
      this.toast.error('As senhas não coincidem');
      return;
    }

    this.isLoading.set(true);

    const dto: RegisterDto = {
      name: name!,
      username: username!,
      email: email!,
      password: password!,
      confirmPassword: confirmPassword!,
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Conta criada com sucesso!');
        this.router.navigate(['/app']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message ?? 'Falha ao criar conta');
      },
    });
  }
}
