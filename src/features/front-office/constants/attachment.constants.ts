// Attachment constants — kept in sync with the backend's allow-list (attachments.service.ts)

export const ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ATTACHMENT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx';

export const ATTACHMENT_HELP_TEXT = 'JPG, PNG, WEBP, PDF, or Word document. Max 10MB.';
