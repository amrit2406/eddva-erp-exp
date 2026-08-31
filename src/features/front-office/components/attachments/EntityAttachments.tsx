import { useEffect, useRef, useState } from 'react';
import { Paperclip, Download, Trash2, FileText, Image as ImageIcon, File as FileIcon, Upload } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { useToast } from '../../../../hooks/useToast';
import { getAttachments, uploadAttachment, deleteAttachment, downloadAttachment } from '../../api/attachments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import {
  ATTACHMENT_MAX_SIZE_BYTES,
  ATTACHMENT_ALLOWED_MIME_TYPES,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_HELP_TEXT,
} from '../../constants/attachment.constants';
import { cn } from '../../../../utils/cn';
import type { AttachmentEntityType, FrontOfficeAttachment } from '../../types/attachmentRecord.types';

interface EntityAttachmentsProps {
  entityType: AttachmentEntityType;
  entityId: string | number;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-600" />;
  if (mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-red-600" />;
  if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-700" />;
  return <FileIcon className="h-4 w-4 text-slate-500" />;
}

export default function EntityAttachments({ entityType, entityId, className }: EntityAttachmentsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<FrontOfficeAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAttachments(entityType, entityId);
      setAttachments(data);
    } catch (err) {
      if ((err as any)?.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load attachments'));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!(ATTACHMENT_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error('That file type is not supported.');
      return;
    }
    if (file.size > ATTACHMENT_MAX_SIZE_BYTES) {
      toast.error('File exceeds the 10MB size limit.');
      return;
    }

    setUploading(true);
    try {
      await uploadAttachment(file, entityType, entityId);
      toast.success('File uploaded.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload file'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(attachment: FrontOfficeAttachment) {
    try {
      const blob = await downloadAttachment(attachment.attachment_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download file'));
    }
  }

  async function handleDelete(attachment: FrontOfficeAttachment) {
    if (!window.confirm(`Delete "${attachment.file_name}"?`)) return;
    setDeletingId(attachment.attachment_id);
    try {
      await deleteAttachment(attachment.attachment_id);
      toast.success('Attachment deleted.');
      setAttachments((prev) => prev.filter((a) => a.attachment_id !== attachment.attachment_id));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete attachment'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-blue-600" />
          Attachments
        </h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            onChange={handleFileSelected}
            className="hidden"
          />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500">{ATTACHMENT_HELP_TEXT}</p>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      ) : loading ? (
        <div className="text-center py-6 text-slate-500 text-sm">Loading...</div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-200 rounded-lg">
          No attachments yet.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
          {attachments.map((attachment) => (
            <div key={attachment.attachment_id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileTypeIcon mimeType={attachment.mime_type} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{attachment.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.size_bytes)} · {new Date(attachment.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                  title="Download"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 disabled:opacity-50"
                  title="Delete"
                  disabled={deletingId === attachment.attachment_id}
                  onClick={() => handleDelete(attachment)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
