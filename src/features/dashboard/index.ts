export { default as DashboardPage } from './pages/DashboardPage';
export { default as StatCard } from './components/StatCard';
export { default as AttendanceOverview } from './components/AttendanceOverview';
export { default as FeeOverview } from './components/FeeOverview';
export { default as RecentActivity } from './components/RecentActivity';
export { useDashboard } from './hooks/useDashboard';
export { getDashboardData } from './api/dashboard.api';
export type { DashboardStats, DashboardData } from './types/dashboard.types';
export type { RecentActivity as RecentActivityItem } from './types/dashboard.types';
