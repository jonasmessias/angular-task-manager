import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ZardButtonComponent } from '../../../shared/components/button/button.component';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../../shared/components/form/form.component';
import { ZardInputDirective } from '../../../shared/components/input/input.directive';
import { RegisterDto } from '../models/auth.model';

@Component({
  selector: 'app-register-page',
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
      <z-card zTitle="Criar Conta">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <z-form-field>
            <z-form-label>Nome</z-form-label>
            <z-form-control>
              <input
                z-input
                type="text"
                formControlName="name"
                placeholder="Seu nome"
                class="w-full"
              />
            </z-form-control>
            @if (hasError('name')) {
              <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('name') }}</p>
            }
          </z-form-field>

          <z-form-field>
            <z-form-label>Username</z-form-label>
            <z-form-control>
              <input
                z-input
                type="text"
                formControlName="username"
                placeholder="seu_username"
                class="w-full"
              />
            </z-form-control>
            @if (hasError('username')) {
              <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('username') }}</p>
            }
          </z-form-field>

          <z-form-field>
            <z-form-label>Email</z-form-label>
            <z-form-control>
              <input
                z-input
                type="email"
                formControlName="email"
                placeholder="seu@email.com"
                class="w-full"
              />
            </z-form-control>
            @if (hasError('email')) {
              <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('email') }}</p>
            }
          </z-form-field>

          <z-form-field>
            <z-form-label>Senha</z-form-label>
            <z-form-control>
              <input
                z-input
                type="password"
                formControlName="password"
                placeholder="••••••"
                class="w-full"
              />
            </z-form-control>
            @if (hasError('password')) {
              <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('password') }}</p>
            }
          </z-form-field>

          <z-form-field>
            <z-form-label>Confirmar Senha</z-form-label>
            <z-form-control>
              <input
                z-input
                type="password"
                formControlName="confirmPassword"
                placeholder="••••••"
                class="w-full"
              />
            </z-form-control>
            @if (hasError('confirmPassword')) {
              <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('confirmPassword') }}</p>
            }
          </z-form-field>

          @if (errorMessage()) {
            <p class="text-sm text-red-500">{{ errorMessage() }}</p>
          }

          <button z-button type="submit" class="w-full" [disabled]="form.invalid || isLoading()">
            {{ isLoading() ? 'Criando conta...' : 'Criar Conta' }}
          </button>

          <p class="text-center text-sm">
            Já tem uma conta?
            <a routerLink="/login" class="text-blue-600 hover:underline">Entrar</a>
          </p>
        </form>
      </z-card>
    </div>
  `,
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const dto: RegisterDto = this.form.value;

    this.authService.register(dto).subscribe({
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

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors) return '';
    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) return 'Mínimo de 6 caracteres';
    if (field.errors['passwordMismatch']) return 'As senhas não coincidem';
    return '';
  }
}
