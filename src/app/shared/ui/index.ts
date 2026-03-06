/**
 * Barrel de exports da camada shared/ui.
 *
 * Importe sempre a partir daqui:
 *   import { AppButtonComponent, AppInputComponent } from '@shared/ui';
 */

// Botão
export { AppButtonComponent } from './button/app-button.component';

// Card
export { PageCardComponent } from './card/page-card.component';

// Badge semântico
export { StatusBadgeComponent } from './badge/status-badge.component';
export type { TaskPriority, TaskStatus } from './badge/status-badge.component';

// Cabeçalho de página
export { PageHeaderComponent } from './page-header/page-header.component';

// Formulário
export { AppFormComponent } from './form/app-form.component';

// Input
export { AppInputComponent } from './input/app-input.component';

// Textarea
export { AppTextareaComponent } from './textarea/app-textarea.component';

// Select
export { AppSelectComponent } from './select/app-select.component';
export type { SelectOption } from './select/app-select.component';

// Checkbox
export { AppCheckboxComponent } from './checkbox/app-checkbox.component';
