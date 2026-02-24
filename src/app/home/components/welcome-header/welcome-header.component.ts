import { Component } from '@angular/core';
import { ZardCardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [ZardCardComponent],
  template: `
    <z-card>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Bem-vindo ao Task Manager! 👋</h1>
          <p class="text-gray-600 mt-2">Gerencie suas tarefas de forma eficiente e organizada</p>
        </div>
      </div>
    </z-card>
  `,
})
export class WelcomeHeaderComponent {}
