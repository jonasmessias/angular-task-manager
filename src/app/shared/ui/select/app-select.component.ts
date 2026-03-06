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

import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../components/form/form.component';
import { ZardSelectItemComponent } from '../../components/select/select-item.component';
import { ZardSelectComponent } from '../../components/select/select.component';
import { ZardSelectTriggerVariants } from '../../components/select/select.variants';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
  ],
  template: `
    <z-form-field [class]="class()">
      @if (label()) {
        <z-form-label [zRequired]="required()">{{ label() }}</z-form-label>
      }
      <z-form-control [errorMessage]="errorText()">
        <z-select
          [zPlaceholder]="placeholder()"
          [zSize]="size()"
          [zDisabled]="disabled()"
          [formControl]="$any(control())"
          (zSelectionChange)="valueChange.emit($event)"
        >
          @for (opt of options(); track opt.value) {
            <z-select-item [zValue]="opt.value" [zDisabled]="opt.disabled ?? false">
              {{ opt.label }}
            </z-select-item>
          }
          <ng-content />
        </z-select>
      </z-form-control>
    </z-form-field>
  `,
})
export class AppSelectComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Selecione...');
  readonly options = input<SelectOption[]>([]);
  readonly control = input<AbstractControl | null>(null);
  readonly size = input<ZardSelectTriggerVariants['zSize']>('default');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input<string>('');
  readonly class = input<ClassValue>('');

  readonly valueChange = output<string>();

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
    if (ctrl?.invalid && ctrl?.touched) return this.extractError(ctrl);
    return '';
  });

  private extractError(ctrl: AbstractControl): string {
    const errors = ctrl.errors;
    if (!errors) return '';
    if (errors['required']) return 'Campo obrigatório';
    const firstKey = Object.keys(errors)[0];
    return typeof errors[firstKey] === 'string' ? errors[firstKey] : 'Campo inválido';
  }
}
