import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZardCardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-page-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardCardComponent],
  template: `
    <z-card class="w-full">
      <!-- Slot para título customizado — ex: <div slot="title" class="text-center">Título</div> -->
      <ng-content select="[slot='title']" />

      <!-- Header padrão via input, renderizado só se não tiver slot customizado -->
      @if (title()) {
        <div class="text-2xl font-semibold leading-none tracking-tight pb-0 mb-6 [&:has(~*)]:mb-1">
          {{ title() }}
        </div>
        @if (description()) {
          <p class="text-sm text-muted-foreground mb-6">{{ description() }}</p>
        }
      }

      <!-- Conteúdo principal -->
      <ng-content />
    </z-card>
  `,
})
export class PageCardComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
}

