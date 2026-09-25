import axiosInstance from '../../../lib/axios';

// Confirmed against the backend's own error message listing every valid
// report key — grouped here just for the picker's UI.
export const REPORT_GROUPS: { label: string; reports: string[] }[] = [
  { label: 'Alumni', reports: ['alumni-directory', 'alumni-by-batch', 'alumni-by-program', 'alumni-employment', 'alumni-location'] },
  { label: 'Events', reports: ['event-registrations', 'event-attendance', 'event-revenue'] },
  { label: 'Jobs', reports: ['job-postings', 'job-applications', 'hiring'] },
  { label: 'Mentorship', reports: ['mentors', 'mentees', 'mentorship-matches'] },
  { label: 'Fundraising', reports: ['campaigns', 'donations', 'donor-history', 'donation-totals', 'payment-modes'] },
  { label: 'Newsletters', reports: ['newsletters', 'delivery-statistics'] },
  { label: 'Engagement', reports: ['engagement'] },
];

export const REPORT_SUGGESTIONS = REPORT_GROUPS.flatMap((group) => group.reports);

export async function getReport(report: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const response = await axiosInstance.get(`/alumni/reports/${report}`, { params });
  return response.data.data ?? response.data;
}

export async function exportReport(
  report: string,
  params: Record<string, unknown> = {}
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await axiosInstance.get(`/alumni/reports/${report}/export`, { params, responseType: 'blob' });
  const contentType = String(response.headers['content-type'] || 'application/octet-stream');
  const disposition = String(response.headers['content-disposition'] || '');
  const match = disposition.match(/filename="?([^"]+)"?/);
  return { blob: new Blob([response.data], { type: contentType }), filename: match?.[1] ?? null };
}
