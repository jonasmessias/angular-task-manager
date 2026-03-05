import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground">Bem-vindo de volta, {{ userName }}! 👋</h1>
        <p class="text-muted-foreground mt-1">Aqui está um resumo das suas atividades.</p>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  userName = this.authService.currentUser?.name ?? 'Usuário';
}
