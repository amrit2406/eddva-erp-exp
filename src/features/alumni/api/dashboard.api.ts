import axiosInstance from '../../../lib/axios';

async function getSection(path: string): Promise<unknown> {
  const response = await axiosInstance.get(`/alumni/dashboard/${path}`);
  return response.data.data ?? response.data;
}

export interface AlumniDashboardSummary {
  alumni: { total: number; verified: number; pending_verification: number };
  events: { upcoming: number; registrations_for_upcoming: number; revenue: number };
  jobs: { open: number; applications: number; hired: number };
  mentorship: { active_programs: number; available_mentors: number; active_matches: number };
  donations: { active_campaigns: number; total: number; donors: number };
  communication: { newsletters_sent: number; failed_deliveries: number };
}

export const getDashboardSummary = () => getSection('summary') as Promise<AlumniDashboardSummary>;
export const getDashboardDirectory = () => getSection('directory');
export const getDashboardEvents = () => getSection('events');
export const getDashboardJobs = () => getSection('jobs');
export const getDashboardMentorship = () => getSection('mentorship');
export const getDashboardDonations = () => getSection('donations');
export const getDashboardCommunication = () => getSection('communication');
