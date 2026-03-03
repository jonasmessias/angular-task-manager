import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ContentComponent } from '../../shared/components/layout/content.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { SidebarComponent as ZSidebarComponent } from '../../shared/components/layout/sidebar.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LayoutComponent, ZSidebarComponent, ContentComponent],
  template: `
    <z-layout>
      <z-sidebar>
        <nav class="p-4">
          <ul class="space-y-2">
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/tasks">Tasks</a></li>
          </ul>
        </nav>
      </z-sidebar>

      <z-content>
        <router-outlet></router-outlet>
      </z-content>
    </z-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      z-layout {
        display: flex;
      }
      z-sidebar {
        flex: 0 0 auto;
      }
      z-content {
        flex: 1;
      }
    `,
  ],
})
export class PrivateLayoutComponent {}
