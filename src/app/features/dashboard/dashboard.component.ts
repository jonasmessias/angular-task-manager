import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p>Bem-vindo! Esta é sua área privada.</p>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 2rem;
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class DashboardComponent {}
