import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <aside class="sidebar">
      <div class="brand">Task Manager</div>
      <nav>
        <ul>
          <li><a routerLink="/">Home</a></li>
          <li><a routerLink="/tasks">Tasks</a></li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sidebar {
        width: 220px;
        padding: 1rem;
        background: #fafafa;
        border-right: 1px solid #e6e6e6;
      }
      .brand {
        font-weight: 700;
        margin-bottom: 1rem;
      }
      nav ul {
        list-style: none;
        padding: 0;
      }
      nav li {
        margin: 0.5rem 0;
      }
      nav a {
        color: inherit;
        text-decoration: none;
      }
    `,
  ],
})
export class SidebarComponent {}
