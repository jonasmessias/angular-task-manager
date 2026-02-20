export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

export interface RecentActivity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed';
  description: string;
  timestamp: Date;
  user?: string;
}
