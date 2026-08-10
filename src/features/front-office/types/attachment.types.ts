// Attachment types for polymorphic attachments

export type AttachmentEntityType = 'visitor' | 'enquiry' | 'complaint';

export interface Attachment {
  id: string;
  entityType: AttachmentEntityType;
  entityId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AttachmentUpload {
  file: File;
  entityType: AttachmentEntityType;
  entityId: string;
}
