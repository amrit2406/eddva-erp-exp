export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  todayAttendance: number;
  pendingFees: number;
  upcomingExams: number;
}

export interface RecentActivity {
  id: string;
  type: 'student' | 'teacher' | 'fee' | 'exam' | 'attendance';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}
