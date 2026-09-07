import axiosInstance from '../../../lib/axios';
import type { VoucherAttachment } from '../types/attachment.types';

export async function getAttachments(voucherId?: string): Promise<VoucherAttachment[]> {
  const response = await axiosInstance.get('/accounts/attachments', {
    params: voucherId ? { voucherId } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function uploadAttachment(voucherId: string, file: File): Promise<VoucherAttachment> {
  const formData = new FormData();
  formData.append('voucherId', voucherId);
  formData.append('file', file);
  const response = await axiosInstance.post('/accounts/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data || response.data;
}

export async function downloadAttachment(id: string): Promise<Blob> {
  const response = await axiosInstance.get(`/accounts/attachments/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

// Note: the real API deletes via DELETE /accounts/attachments/{id} — the /download
// suffix (as originally specified) 404s; verified directly against the live backend.
export async function deleteAttachment(id: string): Promise<void> {
  await axiosInstance.delete(`/accounts/attachments/${id}`);
}
