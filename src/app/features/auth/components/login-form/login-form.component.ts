import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { AppFormComponent } from '@shared/ui/form/app-form.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';
import { LoginDto } from '../../models/auth.model';

@Component({
  selector: 'app-login-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    AppFormComponent,
    AppInputComponent,
    AppButtonComponent,
  ],
  template: `
    <app-form (submitted)="onSubmit()">
      <app-input
        label="Email ou Username"
        placeholder="seu@email.com ou username"
        [control]="form.get('emailOrUsername')"
        [required]="true"
      />

      <app-input
        label="Senha"
        type="password"
        placeholder="••••••"
        [control]="form.get('password')"
        [required]="true"
      />

      <div class="text-right -mt-1">
        <a routerLink="/forgot-password" class="text-sm text-primary hover:underline">
          Esqueci a senha
        </a>
      </div>

      <app-button type="submit" [loading]="isLoading()" [class]="'w-full'"> Entrar </app-button>
    </app-form>
  `,
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);

  readonly isLoading = input(false);
  readonly loginSubmit = output<LoginDto>();

  readonly form = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loginSubmit.emit(this.form.value as LoginDto);
  }
}
