import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent],
  template: `
    <div class="p-6">
      <app-page-header
        [title]="'Bem-vindo de volta, ' + userName() + '! 👋'"
        subtitle="Aqui está um resumo das suas atividades."
      />
    </div>
  `,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  readonly userName = computed(() => this.authService.currentUser?.name ?? 'Usuário');
}
