import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, RecentActivity } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  getDashboardStats(): Observable<DashboardStats> {
    throw new Error('Not implemented');
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    throw new Error('Not implemented');
  }
}
