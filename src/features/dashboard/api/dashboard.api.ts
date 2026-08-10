import type { DashboardData } from '../types/dashboard.types';

// This is a dummy implementation for now
// Later, this will call the real API: GET /dashboard
export const getDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data
  return {
    stats: {
      totalStudents: 1250,
      totalTeachers: 85,
      todayAttendance: 1180,
      pendingFees: 45000,
      upcomingExams: 3,
    },
    recentActivities: [
      {
        id: '1',
        type: 'student',
        title: 'New Student Enrolled',
        description: 'John Doe enrolled in Grade 10',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'fee',
        title: 'Fee Payment Received',
        description: '$500 received from Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        type: 'attendance',
        title: 'Attendance Marked',
        description: 'Grade 9 attendance completed',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  };
};
