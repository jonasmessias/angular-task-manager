import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-reset-password-page',
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
      <z-card zTitle="Redefinir Senha">
        @if (!submitted()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <z-form-field>
              <z-form-label>Nova Senha</z-form-label>
              <z-form-control>
                <input
                  z-input
                  type="password"
                  formControlName="newPassword"
                  placeholder="••••••"
                  class="w-full"
                />
              </z-form-control>
              @if (hasError('newPassword')) {
                <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('newPassword') }}</p>
              }
            </z-form-field>

            <z-form-field>
              <z-form-label>Confirmar Nova Senha</z-form-label>
              <z-form-control>
                <input
                  z-input
                  type="password"
                  formControlName="confirmNewPassword"
                  placeholder="••••••"
                  class="w-full"
                />
              </z-form-control>
              @if (hasError('confirmNewPassword')) {
                <p class="text-sm text-red-500 mt-1">{{ getErrorMessage('confirmNewPassword') }}</p>
              }
            </z-form-field>

            @if (errorMessage()) {
              <p class="text-sm text-red-500">{{ errorMessage() }}</p>
            }

            <button z-button type="submit" class="w-full" [disabled]="form.invalid || isLoading()">
              {{ isLoading() ? 'Salvando...' : 'Redefinir Senha' }}
            </button>
          </form>
        } @else {
          <div class="text-center space-y-4">
            <p class="text-green-600 font-medium">Senha redefinida com sucesso!</p>
            <a routerLink="/login">
              <button z-button class="w-full">Ir para o Login</button>
            </a>
          </div>
        }
      </z-card>
    </div>
  `,
})
export class ResetPasswordPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private token = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  form: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
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
      .resetPassword({ token: this.token, newPassword, confirmNewPassword })
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

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors) return '';
    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['minlength']) return 'Mínimo de 6 caracteres';
    return '';
  }
}
