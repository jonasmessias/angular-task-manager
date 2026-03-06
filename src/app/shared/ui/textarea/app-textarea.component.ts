import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import type { ClassValue } from 'clsx';

import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../components/form/form.component';
import { ZardInputDirective } from '../../components/input/input.directive';
import { ZardInputVariants } from '../../components/input/input.variants';

@Component({
  selector: 'app-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
  ],
  template: `
    <z-form-field [class]="class()">
      @if (label()) {
        <z-form-label [zRequired]="required()">{{ label() }}</z-form-label>
      }
      <z-form-control [errorMessage]="errorText()">
        <textarea
          z-input
          [placeholder]="placeholder()"
          [zStatus]="inputStatus()"
          [formControl]="$any(control())"
          [rows]="rows()"
          [class]="inputClass()"
        ></textarea>
      </z-form-control>
    </z-form-field>
  `,
})
export class AppTextareaComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly control = input<AbstractControl | null>(null);
  readonly rows = input<number>(4);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input<string>('');
  readonly helpText = input<string>('');
  readonly status = input<ZardInputVariants['zStatus']>();
  readonly class = input<ClassValue>('');
  readonly inputClass = input<ClassValue>('');

  private readonly _tick = signal(0);

  constructor() {
    let sub: { unsubscribe(): void } | undefined;

    effect(() => {
      sub?.unsubscribe();
      const ctrl = this.control();
      if (!ctrl) return;
      sub = ctrl.events.subscribe(() => this._tick.update((v) => v + 1));
    });

    effect(() => {
      const ctrl = this.control();
      if (!ctrl) return;
      this.disabled() ? ctrl.disable({ emitEvent: false }) : ctrl.enable({ emitEvent: false });
    });
  }

  readonly errorText = computed(() => {
    this._tick();
    if (this.error()) return this.error();
    const ctrl = this.control();
    if (ctrl?.invalid && ctrl?.touched) return this.extractError(ctrl);
    return '';
  });

  readonly inputStatus = computed<ZardInputVariants['zStatus']>(() => {
    this._tick();
    if (this.status()) return this.status();
    const ctrl = this.control();
    if (ctrl?.invalid && ctrl?.touched) return 'error';
    return undefined;
  });

  private extractError(ctrl: AbstractControl): string {
    const errors = ctrl.errors;
    if (!errors) return '';
    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';
    const firstKey = Object.keys(errors)[0];
    return typeof errors[firstKey] === 'string' ? errors[firstKey] : 'Campo inválido';
  }
}
