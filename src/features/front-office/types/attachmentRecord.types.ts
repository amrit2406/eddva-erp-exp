export type AttachmentEntityType = 'visitor' | 'enquiry' | 'complaint';

export interface FrontOfficeAttachment {
  attachment_id: number;
  entity_type: AttachmentEntityType;
  entity_id: number;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface AttachmentUploadData {
  file: File;
  entity_type: AttachmentEntityType;
  entity_id: number;
}

export interface AttachmentDownloadResult {
  blob: Blob;
  filename: string;
}
