import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZardCardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-page-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardCardComponent],
  template: `
    <z-card [zTitle]="title()" [zDescription]="description()" class="w-full">
      <ng-content />
    </z-card>
  `,
})
export class PageCardComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
}
