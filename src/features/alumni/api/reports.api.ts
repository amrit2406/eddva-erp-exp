import axiosInstance from '../../../lib/axios';

export const REPORT_SUGGESTIONS = ['summary', 'directory', 'events', 'jobs', 'mentorship', 'donations', 'communication'];

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
