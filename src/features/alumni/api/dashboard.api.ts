import axiosInstance from '../../../lib/axios';

async function getSection(path: string): Promise<unknown> {
  const response = await axiosInstance.get(`/alumni/dashboard/${path}`);
  return response.data.data ?? response.data;
}

export const getDashboardSummary = () => getSection('summary');
export const getDashboardDirectory = () => getSection('directory');
export const getDashboardEvents = () => getSection('events');
export const getDashboardJobs = () => getSection('jobs');
export const getDashboardMentorship = () => getSection('mentorship');
export const getDashboardDonations = () => getSection('donations');
export const getDashboardCommunication = () => getSection('communication');
