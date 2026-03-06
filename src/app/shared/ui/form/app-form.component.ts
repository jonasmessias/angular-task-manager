import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ClassValue } from 'clsx';
import { mergeClasses } from '../../utils/merge-classes';

@Component({
  selector: 'app-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [class]="classes()" (submit)="onSubmit($event)" novalidate>
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

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.submitted.emit();
  }

  protected readonly classes = computed(() => {
    const gapClass: Record<string, string> = {
      sm: 'gap-3',
      default: 'gap-4',
      lg: 'gap-6',
    };

    const gridClass: Record<number, string> = {
      1: 'flex flex-col',
      2: 'grid grid-cols-1 sm:grid-cols-2',
      3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return mergeClasses(`${gridClass[this.cols()]} ${gapClass[this.gap()]}`, this.class());
  });
}
