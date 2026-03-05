import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ZardButtonComponent } from '../../../shared/components/button/button.component';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../../shared/components/form/form.component';
import { ZardInputDirective } from '../../../shared/components/input/input.directive';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
  ],
  template: `
    <div class="auth-page max-w-md mx-auto mt-24 px-4">
      <z-card zTitle="Recuperar Senha">
        @if (!submitted()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <p class="text-sm text-gray-500">
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>

            <z-form-field>
              <z-form-label>Email</z-form-label>
              <z-form-control>
                <input z-input type="email" formControlName="email" placeholder="seu@email.com" class="w-full" />
              </z-form-control>
              @if (hasError('email')) {
                <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('email') }}</p>
              }
            </z-form-field>

            @if (errorMessage()) {
              <p class="text-sm text-red-500">{{ errorMessage() }}</p>
            }

            <button z-button type="submit" class="w-full" [disabled]="form.invalid || isLoading()">
              {{ isLoading() ? 'Enviando...' : 'Enviar Link' }}
            </button>

            <p class="text-center text-sm">
              <a routerLink="/login" class="text-blue-600 hover:underline">Voltar para Login</a>
            </p>
          </form>
        } @else {
          <div class="text-center space-y-4">
            <p class="text-green-600 font-medium">Email enviado com sucesso!</p>
            <p class="text-sm text-gray-500">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <a routerLink="/login">
              <button z-button zVariant="outline" class="w-full">Voltar para Login</button>
            </a>
          </div>
        }
      </z-card>
    </div>
  `,
})
export class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.form.value).subscribe({
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

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors) return '';
    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['email']) return 'Email inválido';
    return '';
  }
}
