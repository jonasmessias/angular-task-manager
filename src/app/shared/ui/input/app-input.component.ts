import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import type { ClassValue } from 'clsx';

import {
  ZardFormControlComponent,
  ZardFormFieldComponent,
  ZardFormLabelComponent,
} from '../../components/form/form.component';
import { ZardIconComponent } from '../../components/icon/icon.component';
import { ZardInputDirective } from '../../components/input/input.directive';
import { ZardInputVariants } from '../../components/input/input.variants';

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
    ZardIconComponent,
  ],
  template: `
    <z-form-field [class]="class()">
      @if (label()) {
        <z-form-label [zRequired]="required()">{{ label() }}</z-form-label>
      }
      <z-form-control [errorMessage]="errorText()">
        <div class="relative flex items-center">
          <input
            z-input
            [type]="resolvedType()"
            [placeholder]="placeholder()"
            [zSize]="size()"
            [zStatus]="inputStatus()"
            [formControl]="$any(control())"
            [class]="inputClass()"
            [class.pr-10]="isPassword()"
          />
          @if (isPassword()) {
            <button
              type="button"
              tabindex="-1"
              class="absolute right-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              (click)="toggleVisibility()"
              [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <z-icon
                [zType]="showPassword() ? 'eye-off' : 'eye'"
                class="size-4 pointer-events-none"
              />
            </button>
          }
        </div>
      </z-form-control>
    </z-form-field>
  `,
})
export class AppInputComponent {
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly control = input<AbstractControl | null>(null);
  readonly size = input<ZardInputVariants['zSize']>('default');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input<string>('');
  readonly helpText = input<string>('');
  readonly status = input<ZardInputVariants['zStatus']>();
  readonly class = input<ClassValue>('');
  readonly inputClass = input<ClassValue>('');

  readonly isPassword = computed(() => this.type() === 'password');
  readonly showPassword = signal(false);
  readonly resolvedType = computed(() =>
    this.isPassword() && this.showPassword() ? 'text' : this.type(),
  );

  toggleVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  /** Internal tick signal incremented on every control event (value, status, touched). */
  private readonly _tick = signal(0);

  constructor() {
    let sub: { unsubscribe(): void } | undefined;

    // Re-subscribe to control events whenever the control reference changes.
    effect(() => {
      sub?.unsubscribe();
      const ctrl = this.control();
      if (!ctrl) return;
      sub = ctrl.events.subscribe(() => this._tick.update((v) => v + 1));
    });

    // Sync the disabled input to the control state instead of using [disabled] in the template.
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
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
    const firstKey = Object.keys(errors)[0];
    return typeof errors[firstKey] === 'string' ? errors[firstKey] : 'Campo inválido';
  }
}
