import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start justify-between gap-4 mb-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ title() }}
        </h1>
        @if (subtitle()) {
          <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
        }
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
