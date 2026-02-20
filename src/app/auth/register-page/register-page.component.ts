import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardCardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterModule, ZardCardComponent, ZardButtonComponent],
  template: `
    <div class="auth-page max-w-md mx-auto mt-24">
      <z-card zTitle="Criar Conta">
        <p class="mb-4">Página de registro (em desenvolvimento)</p>
        <a routerLink="/login">
          <button z-button zVariant="outline" class="w-full">Voltar para Login</button>
        </a>
      </z-card>
    </div>
  `,
})
export class RegisterPageComponent {}
