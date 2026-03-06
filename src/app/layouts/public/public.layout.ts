import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ZardIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ZardIconComponent],
  template: `
    <div class="min-h-screen flex bg-background">

      <!-- ── Painel esquerdo (decorativo) ─────────────────────────── -->
      <aside class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between
                    bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-800
                    overflow-hidden p-12 select-none">

        <!-- Grade decorativa de fundo -->
        <div class="absolute inset-0 opacity-[0.04]"
             style="background-image: linear-gradient(#fff 1px, transparent 1px),
                                      linear-gradient(to right, #fff 1px, transparent 1px);
                    background-size: 40px 40px;">
        </div>

        <!-- Orbes de luz -->
        <div class="absolute -top-40 -left-40 w-120 h-120 rounded-full
                    bg-primary/20 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-0 right-0 w-90 h-90 rounded-full
                    bg-primary/10 blur-[100px] pointer-events-none"></div>

        <!-- Logo / Marca -->
        <div class="relative z-10 flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <z-icon zType="layers" class="size-5 text-primary-foreground" />
          </div>
          <span class="text-white font-semibold text-lg tracking-tight">Task Manager</span>
        </div>

        <!-- Conteúdo central -->
        <div class="relative z-10 space-y-6">
          <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Organize seu trabalho<br />
            <span class="text-primary">com clareza.</span>
          </h1>
          <p class="text-neutral-400 text-base xl:text-lg leading-relaxed max-w-sm">
            Workspaces, boards, listas e cards — tudo em um só lugar para você e seu time.
          </p>

          <!-- Destaques -->
          <ul class="space-y-3 pt-2">
            @for (item of highlights; track item.label) {
              <li class="flex items-center gap-3 text-neutral-300 text-sm">
                <div class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 shrink-0">
                  <z-icon [zType]="item.icon" class="size-3 text-primary" />
                </div>
                {{ item.label }}
              </li>
            }
          </ul>
        </div>

        <!-- Rodapé do painel -->
        <p class="relative z-10 text-neutral-600 text-xs">
          © {{ year }} Task Manager. Todos os direitos reservados.
        </p>
      </aside>

      <!-- ── Painel direito (conteúdo / rotas) ─────────────────────── -->
      <main class="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">

        <!-- Logo visível apenas em mobile -->
        <div class="flex lg:hidden items-center gap-2 mb-10 self-start">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <z-icon zType="layers" class="size-4 text-primary-foreground" />
          </div>
          <span class="font-semibold text-base tracking-tight">Task Manager</span>
        </div>

        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </main>

    </div>
  `,
})
export class PublicLayoutComponent {
  readonly year = new Date().getFullYear();

  readonly highlights = [
    { icon: 'layout-dashboard' as const, label: 'Boards visuais para qualquer fluxo de trabalho' },
    { icon: 'users'            as const, label: 'Colaboração em tempo real com seu time' },
    { icon: 'layers'           as const, label: 'Hierarquia clara: Workspace → Board → Lista → Card' },
  ];
}
