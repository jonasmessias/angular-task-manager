import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import type { ClassValue } from 'clsx';

import { ZardCheckboxComponent } from '../../components/checkbox/checkbox.component';
import { ZardCheckboxVariants } from '../../components/checkbox/checkbox.variants';
import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
} from '../../components/form/form.component';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardCheckboxComponent,
  ],
  template: `
    <z-form-field>
      <z-form-control [errorMessage]="errorText()">
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
      </z-form-control>
    </z-form-field>
  `,
})
export class AppCheckboxComponent {
  readonly label = input<string>('');
  readonly control = input<AbstractControl | null>(null);
  readonly variant = input<ZardCheckboxVariants['zType']>('default');
  readonly size = input<ZardCheckboxVariants['zSize']>('default');
  readonly disabled = input(false);
  readonly error = input<string>('');
  readonly class = input<ClassValue>('');

  readonly checkedChange = output<boolean>();

  private readonly _tick = signal(0);

  constructor() {
    let sub: { unsubscribe(): void } | undefined;

    effect(() => {
      sub?.unsubscribe();
      const ctrl = this.control();
      if (!ctrl) return;
      sub = ctrl.events.subscribe(() => this._tick.update((v) => v + 1));
    });
  }

  readonly errorText = computed(() => {
    this._tick();
    if (this.error()) return this.error();
    const ctrl = this.control();
    if (ctrl?.invalid && ctrl?.touched) return 'Campo obrigatório';
    return '';
  });
}
