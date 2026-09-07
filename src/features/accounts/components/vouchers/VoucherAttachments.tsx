import { useEffect, useRef, useState } from 'react';
import { Paperclip, Download, Trash2, Upload, FileText } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { getAttachments, uploadAttachment, downloadAttachment, deleteAttachment } from '../../api/attachments.api';
import { getApiErrorMessage } from '../../utils/errors';
import { downloadBlob } from '../../utils/downloadBlob';
import type { VoucherAttachment } from '../../types/attachment.types';

interface VoucherAttachmentsProps {
  voucherId: string;
}

function fileNameFromUrl(fileUrl: string): string {
  const base = fileUrl.split('/').pop() ?? fileUrl;
  // Uploaded files are stored as "<timestamp>-<original name>"
  const dashIndex = base.indexOf('-');
  return dashIndex > 0 && /^\d+$/.test(base.slice(0, dashIndex)) ? base.slice(dashIndex + 1) : base;
}

export default function VoucherAttachments({ voucherId }: VoucherAttachmentsProps) {
  const [attachments, setAttachments] = useState<VoucherAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voucherId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAttachments(voucherId);
      setAttachments(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load attachments'));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      await uploadAttachment(voucherId, file);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to upload attachment'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDownload(attachment: VoucherAttachment) {
    try {
      setDownloadingId(attachment.id);
      const blob = await downloadAttachment(attachment.id);
      downloadBlob(blob, fileNameFromUrl(attachment.fileUrl));
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to download attachment'));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(attachment: VoucherAttachment) {
    if (!window.confirm(`Delete "${fileNameFromUrl(attachment.fileUrl)}"?`)) return;
    try {
      await deleteAttachment(attachment.id);
      setAttachments(attachments.filter((a) => a.id !== attachment.id));
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete attachment'));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-blue-600" />
          Attachments
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-slate-500">No attachments uploaded for this voucher yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 truncate">{fileNameFromUrl(attachment.fileUrl)}</p>
                  <p className="text-xs text-slate-500">
                    Uploaded {new Date(attachment.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownload(attachment)}
                  disabled={downloadingId === attachment.id}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(attachment)}
                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
