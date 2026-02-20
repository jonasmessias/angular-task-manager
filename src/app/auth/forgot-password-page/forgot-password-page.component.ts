import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardCardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [RouterModule, ZardCardComponent, ZardButtonComponent],
  template: `
    <div class="auth-page max-w-md mx-auto mt-24">
      <z-card zTitle="Recuperar Senha">
        <p class="mb-4">Página de recuperação de senha (em desenvolvimento)</p>
        <a routerLink="/login">
          <button z-button zVariant="outline" class="w-full">Voltar para Login</button>
        </a>
      </z-card>
    </div>
  `,
})
export class ForgotPasswordPageComponent {}
