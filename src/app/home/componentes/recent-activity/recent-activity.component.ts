import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ZardBadgeComponent } from '../../../shared/components/badge/badge.component';
import { ZardBadgeVariants } from '../../../shared/components/badge/badge.variants';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import { RecentActivity } from '../../models/dashboard.model';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, ZardBadgeComponent],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css'],
})
export class RecentActivityComponent {
  @Input({ required: true }) activities: RecentActivity[] = [];

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      task_created: '➕',
      task_updated: '✏️',
      task_completed: '✅',
    };
    return icons[type] || '📋';
  }

  getActivityBadgeColor(type: string): ZardBadgeVariants['zType'] {
    const colors: Record<string, ZardBadgeVariants['zType']> = {
      task_created: 'default',
      task_updated: 'secondary',
      task_completed: 'destructive',
    };
    return colors[type] || 'default';
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'agora mesmo';
  }
}
