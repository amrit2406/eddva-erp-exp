import axiosInstance from '../../../lib/axios';
import type { AttachmentEntityType, FrontOfficeAttachment } from '../types/attachmentRecord.types';

export async function getAttachments(entityType: AttachmentEntityType, entityId: string | number): Promise<FrontOfficeAttachment[]> {
  const response = await axiosInstance.get('/front-office/attachments', {
    params: { entity_type: entityType, entity_id: entityId },
  });
  return response.data.data || response.data || [];
}

export async function getAttachment(id: string | number): Promise<FrontOfficeAttachment> {
  const response = await axiosInstance.get(`/front-office/attachments/${id}`);
  return response.data.data || response.data;
}

export async function uploadAttachment(
  file: File,
  entityType: AttachmentEntityType,
  entityId: string | number
): Promise<FrontOfficeAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entity_type', entityType);
  formData.append('entity_id', String(entityId));
  const response = await axiosInstance.post('/front-office/attachments', formData, {
    // The axios instance sets a default 'Content-Type: application/json' header, which
    // stops axios from letting the browser set the multipart boundary — clearing it here
    // is required, otherwise FormData gets silently JSON-stringified instead of uploaded.
    headers: { 'Content-Type': undefined },
  });
  return response.data.data || response.data;
}

export async function deleteAttachment(id: string | number): Promise<void> {
  await axiosInstance.delete(`/front-office/attachments/${id}`);
}

export async function downloadAttachment(id: string | number): Promise<Blob> {
  const response = await axiosInstance.get(`/front-office/attachments/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}
