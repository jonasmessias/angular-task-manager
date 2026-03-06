import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ZardBadgeComponent } from '../../components/badge/badge.component';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

const STATUS_CONFIG: Record<TaskStatus, { label: string; class: string }> = {
  todo: { label: 'A fazer', class: 'bg-secondary text-secondary-foreground border-transparent' },
  in_progress: {
    label: 'Em progresso',
    class: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400',
  },
  done: {
    label: 'Concluído',
    class:
      'bg-green-100 text-green-700 border-transparent dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: { label: 'Cancelado', class: 'bg-destructive/10 text-destructive border-transparent' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; class: string }> = {
  low: { label: 'Baixa', class: 'bg-secondary text-secondary-foreground border-transparent' },
  medium: {
    label: 'Média',
    class:
      'bg-yellow-100 text-yellow-700 border-transparent dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  high: {
    label: 'Alta',
    class: 'bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400',
  },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardBadgeComponent],
  template: `
    <z-badge zType="outline" [class]="badgeClass()">
      {{ label() }}
    </z-badge>
  `,
})
export class StatusBadgeComponent {
  readonly status = input<TaskStatus | null>(null);
  readonly priority = input<TaskPriority | null>(null);

  readonly label = computed(() => {
    const s = this.status();
    const p = this.priority();
    if (s) return STATUS_CONFIG[s].label;
    if (p) return PRIORITY_CONFIG[p].label;
    return '';
  });

  readonly badgeClass = computed(() => {
    const s = this.status();
    const p = this.priority();
    if (s) return STATUS_CONFIG[s].class;
    if (p) return PRIORITY_CONFIG[p].class;
    return '';
  });
}
