import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZardCardComponent } from '../../../shared/components/card/card.component';
import { DashboardStats } from '../../models/dashboard.model';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, RouterModule, ZardCardComponent],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css'],
})
export class StatsCardsComponent {
  @Input({ required: true }) stats!: DashboardStats;

  getCompletionPercentage(): number {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
  }
}
