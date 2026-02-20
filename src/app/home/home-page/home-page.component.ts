import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RecentActivityComponent } from '../componentes/recent-activity/recent-activity.component';
import { StatsCardsComponent } from '../componentes/stats-cards/stats-cards.component';
import { WelcomeHeaderComponent } from '../componentes/welcome-header/welcome-header.component';
import { DashboardStats, RecentActivity } from '../models/dashboard.model';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsCardsComponent,
    RecentActivityComponent,
    WelcomeHeaderComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  private homeService = inject(HomeService);

  stats = signal<DashboardStats | null>(null);
  activities = signal<RecentActivity[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.homeService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
      },
    });

    this.homeService.getRecentActivities().subscribe({
      next: (activities) => {
        this.activities.set(activities);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar atividades:', err);
        this.isLoading.set(false);
      },
    });
  }
}
