import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZardButtonComponent } from '../../components/button/button.component';
import { ZardButtonVariants } from '../../components/button/button.variants';
import { ZardIconComponent } from '../../components/icon/icon.component';
import { ZardIcon } from '../../components/icon/icons';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardButtonComponent, ZardIconComponent],
  template: `
    <button z-button [zType]="variant()" [zSize]="size()" [zLoading]="loading()" [class]="class()">
      @if (icon()) {
        <z-icon [zType]="icon()!" class="size-4" />
      }
      <ng-content />
    </button>
  `,
})
export class AppButtonComponent {
  readonly variant = input<ZardButtonVariants['zType']>('default');
  readonly size = input<ZardButtonVariants['zSize']>('default');
  readonly icon = input<ZardIcon | null>(null);
  readonly loading = input(false);
  readonly class = input('');
}
