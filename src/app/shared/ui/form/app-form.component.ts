import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ClassValue } from 'clsx';
import { mergeClasses } from '../../utils/merge-classes';

@Component({
  selector: 'app-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [class]="classes()" (ngSubmit)="submitted.emit()" novalidate>
      <ng-content />
    </form>
  `,
  host: { class: 'block w-full' },
})
export class AppFormComponent {
  readonly cols = input<1 | 2 | 3 | 4>(1);
  readonly gap = input<'sm' | 'default' | 'lg'>('default');
  readonly class = input<ClassValue>('');
  readonly submitted = output<void>();

  protected readonly classes = () => {
    const cols = this.cols();
    const gap = this.gap();

    const gapClass = {
      sm: 'gap-3',
      default: 'gap-4',
      lg: 'gap-6',
    }[gap];

    const gridClass =
      cols === 1
        ? 'flex flex-col'
        : cols === 2
          ? 'grid grid-cols-1 sm:grid-cols-2'
          : cols === 3
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return mergeClasses(`${gridClass} ${gapClass}`, this.class());
  };
}
