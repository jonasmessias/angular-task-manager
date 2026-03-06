import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { API_ERROR_CODES } from '@core/constants/api-error-codes.const';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { AppButtonComponent } from '@shared/ui/button/app-button.component';
import { PageCardComponent } from '@shared/ui/card/page-card.component';
import { AppInputComponent } from '@shared/ui/input/app-input.component';

const COOLDOWN_SECONDS = 60;
const CIRCLE_RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

type PageState = 'verifying' | 'verified' | 'token-error' | 'resend' | 'from-register';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    PageCardComponent,
    AppButtonComponent,
    AppInputComponent,
  ],
  template: `
    <app-page-card title="Verificação de Email">
      <div class="flex flex-col items-center gap-6 py-2">
        <!-- ── FROM REGISTER (post-signup flow) ── -->
        @if (state() === 'from-register') {
          <!-- Steps -->
          <div class="flex items-center w-full gap-0 mb-2">
            <div class="flex flex-col items-center flex-1">
              <div
                class="flex items-center justify-center size-8 rounded-full bg-green-500 text-white text-xs font-bold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <span class="text-xs text-green-500 font-medium mt-1">Cadastro</span>
            </div>
            <div class="flex-1 h-px bg-primary mb-4"></div>
            <div class="flex flex-col items-center flex-1">
              <div
                class="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-xs font-bold ring-4 ring-primary/20"
              >
                2
              </div>
              <span class="text-xs text-primary font-medium mt-1">Verificação</span>
            </div>
            <div class="flex-1 h-px bg-border mb-4"></div>
            <div class="flex flex-col items-center flex-1">
              <div
                class="flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground text-xs font-bold"
              >
                3
              </div>
              <span class="text-xs text-muted-foreground mt-1">Acesso</span>
            </div>
          </div>

          <!-- Icon -->
          <div class="relative flex items-center justify-center size-20">
            @if (cooldown() > 0) {
              <svg class="absolute inset-0 size-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  [attr.r]="radius"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  class="text-border"
                />
                <circle
                  cx="32"
                  cy="32"
                  [attr.r]="radius"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  class="text-primary transition-all duration-1000 ease-linear"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="dashOffset()"
                />
              </svg>
              <span class="text-2xl select-none z-10">⏱️</span>
            } @else {
              <div
                class="flex items-center justify-center size-full rounded-full bg-primary/10 text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            }
          </div>

          <!-- Message -->
          <div class="text-center space-y-2">
            <p class="font-semibold text-foreground">Conta criada com sucesso! 🎉</p>
            <p class="text-sm text-muted-foreground">Enviamos um email de verificação para</p>
            <p class="font-medium text-foreground break-all">{{ email() }}</p>
            <p class="text-sm text-muted-foreground">
              Clique no link do email para ativar sua conta e liberar o acesso. Não encontrou?
              Verifique sua pasta de spam.
            </p>
          </div>

          <!-- Actions -->
          <div class="w-full space-y-3">
            <app-button
              [class]="'w-full'"
              [loading]="isLoading()"
              [attr.disabled]="cooldown() > 0 ? true : null"
              (click)="resend()"
            >
              @if (cooldown() > 0) {
                Reenviar em {{ cooldown() }}s
              } @else {
                Reenviar Email de Verificação
              }
            </app-button>
            <a routerLink="/login">
              <app-button variant="outline" [class]="'w-full'"
                >Já verifiquei, fazer login</app-button
              >
            </a>
          </div>
        }

        <!-- ── VERIFYING (loading) ── -->
        @if (state() === 'verifying') {
          <div class="flex items-center justify-center size-20">
            <svg
              class="size-10 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="3"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
          <p class="text-sm text-muted-foreground text-center">Verificando seu email...</p>
        }

        <!-- ── VERIFIED (success) ── -->
        @if (state() === 'verified') {
          <div
            class="flex items-center justify-center size-20 rounded-full bg-green-500/10 text-green-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div class="text-center space-y-1">
            <p class="font-semibold text-foreground">Email verificado com sucesso! 🎉</p>
            <p class="text-sm text-muted-foreground">
              Sua conta está ativa. Redirecionando para o app em
              <span class="font-semibold text-foreground">{{ redirectCountdown() }}s</span>...
            </p>
          </div>
          <a routerLink="/login" class="w-full">
            <app-button [class]="'w-full'">Entrar agora</app-button>
          </a>
        }

        <!-- ── TOKEN ERROR ── -->
        @if (state() === 'token-error') {
          <div
            class="flex items-center justify-center size-20 rounded-full bg-destructive/10 text-destructive"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </div>
          <div class="text-center space-y-1">
            <p class="font-semibold text-foreground">Link inválido ou expirado</p>
            <p class="text-sm text-muted-foreground">
              Solicite um novo link de verificação abaixo.
            </p>
          </div>
          <a routerLink="/verify-email" class="w-full">
            <app-button variant="outline" [class]="'w-full'">Solicitar novo link</app-button>
          </a>
        }

        <!-- ── RESEND ── -->
        @if (state() === 'resend') {
          <!-- Icon / countdown ring -->
          <div class="relative flex items-center justify-center size-20">
            @if (cooldown() > 0) {
              <svg class="absolute inset-0 size-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  [attr.r]="radius"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  class="text-border"
                />
                <circle
                  cx="32"
                  cy="32"
                  [attr.r]="radius"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  class="text-primary transition-all duration-1000 ease-linear"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="dashOffset()"
                />
              </svg>
              <span class="text-2xl select-none z-10">⏱️</span>
            } @else {
              <div
                class="flex items-center justify-center size-full rounded-full bg-primary/10 text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            }
          </div>

          <div class="text-center space-y-2">
            <p class="text-sm text-muted-foreground">
              Sua conta ainda não foi verificada. Acesse o link que enviamos para
            </p>
            @if (email()) {
              <p class="font-medium text-foreground break-all">{{ email() }}</p>
              <p class="text-sm text-muted-foreground">
                Não encontrou? Verifique sua pasta de spam ou reenvie o email abaixo.
              </p>
            } @else {
              <p class="text-sm text-muted-foreground">
                Informe o email cadastrado para reenviarmos a verificação.
              </p>
            }
          </div>

          <div class="w-full space-y-3">
            @if (!email()) {
              <app-input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                [control]="emailControl"
                [required]="true"
              />
            }

            <app-button
              [class]="'w-full'"
              [loading]="isLoading()"
              [attr.disabled]="cooldown() > 0 ? true : null"
              (click)="resend()"
            >
              @if (cooldown() > 0) {
                Reenviar em {{ cooldown() }}s
              } @else {
                Reenviar Email de Verificação
              }
            </app-button>

            <a routerLink="/login">
              <app-button variant="outline" [class]="'w-full'"> Voltar para Login </app-button>
            </a>
          </div>
        }
      </div>
    </app-page-card>
  `,
})
export class VerifyEmailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly state = signal<PageState>('resend');
  readonly email = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly cooldown = signal(0);
  readonly redirectCountdown = signal(3);

  readonly emailControl = this.fb.control('', [Validators.required, Validators.email]);

  readonly radius = CIRCLE_RADIUS;
  readonly circumference = CIRCUMFERENCE;

  readonly dashOffset = computed(() => CIRCUMFERENCE * (1 - this.cooldown() / COOLDOWN_SECONDS));

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private redirectIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    const from = this.route.snapshot.queryParamMap.get('from');

    if (token) {
      this.verifyToken(token);
    } else if (from === 'register' && emailParam) {
      this.email.set(emailParam);
      this.state.set('from-register');
    } else {
      this.state.set('resend');
      if (emailParam) {
        this.email.set(emailParam);
      }
    }
  }

  ngOnDestroy(): void {
    this.clearInterval();
    if (this.redirectIntervalId !== null) {
      clearInterval(this.redirectIntervalId);
    }
  }

  private verifyToken(token: string): void {
    this.state.set('verifying');

    this.authService.verifyEmail({ token }).subscribe({
      next: () => {
        this.state.set('verified');
        this.startRedirectCountdown();
      },
      error: (err: HttpErrorResponse) => {
        const code: string | undefined = err.error?.code;

        if (code === API_ERROR_CODES.EMAIL_ALREADY_VERIFIED) {
          this.state.set('verified');
          this.startRedirectCountdown();
          return;
        }

        this.state.set('token-error');
      },
    });
  }

  resend(): void {
    if (this.cooldown() > 0 || this.isLoading()) return;

    let emailValue = this.email();

    if (!emailValue) {
      this.emailControl.markAsTouched();
      if (this.emailControl.invalid) return;
      emailValue = this.emailControl.value!;
    }

    this.isLoading.set(true);

    this.authService.resendVerification({ email: emailValue }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Email de verificação reenviado com sucesso!');
        this.startCooldown();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const code: string | undefined = err.error?.code;

        if (code === API_ERROR_CODES.EMAIL_ALREADY_VERIFIED) {
          this.toast.success('Seu email já foi verificado. Faça login normalmente.');
          return;
        }

        this.toast.error(err.error?.message ?? 'Falha ao reenviar email. Tente novamente.');
      },
    });
  }

  private startCooldown(): void {
    this.cooldown.set(COOLDOWN_SECONDS);
    this.clearInterval();

    this.intervalId = setInterval(() => {
      const current = this.cooldown();
      if (current <= 1) {
        this.cooldown.set(0);
        this.clearInterval();
      } else {
        this.cooldown.set(current - 1);
      }
    }, 1000);
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startRedirectCountdown(): void {
    this.redirectCountdown.set(3);
    this.redirectIntervalId = setInterval(() => {
      const current = this.redirectCountdown();
      if (current <= 1) {
        clearInterval(this.redirectIntervalId!);
        this.redirectIntervalId = null;
        this.router.navigate(['/login']);
      } else {
        this.redirectCountdown.set(current - 1);
      }
    }, 1000);
  }
}
