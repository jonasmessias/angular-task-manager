import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import type { ClassValue } from 'clsx';

import { ZardCheckboxComponent } from '../../components/checkbox/checkbox.component';
import { ZardCheckboxVariants } from '../../components/checkbox/checkbox.variants';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ZardCheckboxComponent],
  template: `
    <z-checkbox
      [zType]="variant()"
      [zSize]="size()"
      [disabled]="disabled()"
      [formControl]="$any(control())"
      (checkChange)="checkedChange.emit($event)"
      [class]="class()"
    >
      {{ label() }}
    </z-checkbox>
  `,
})
export class AppCheckboxComponent {
  readonly label = input<string>('');
  readonly control = input<AbstractControl | null>(null);
  readonly variant = input<ZardCheckboxVariants['zType']>('default');
  readonly size = input<ZardCheckboxVariants['zSize']>('default');
  readonly disabled = input(false);
  readonly class = input<ClassValue>('');

  readonly checkedChange = output<boolean>();
}
