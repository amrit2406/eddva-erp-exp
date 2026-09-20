import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Eye, FileText, Plus, XCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../common/AccessNotice';
import DocumentStatusBadge from './DocumentStatusBadge';
import DocumentUploadForm from './DocumentUploadForm';
import ReasonModal from '../common/ReasonModal';
import {
  downloadApplicationDocument,
  getApplicationDocuments,
  rejectApplicationDocument,
  uploadApplicationDocument,
  verifyApplicationDocument,
} from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { saveBlob } from '../../utils/download';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate, formatFileSize, formatLabel } from '../../utils/format';
import type { ApplicationDocument, DocumentUploadData } from '../../types/admission.types';

// RBAC resource the documents endpoints are checked against.
const DOCUMENTS_RESOURCE = 'documents';

interface DocumentsPanelProps {
  applicationId: number;
}

export default function DocumentsPanel({ applicationId }: DocumentsPanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(DOCUMENTS_RESOURCE);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<ApplicationDocument | null>(null);

  useEffect(() => {
    let cancelled = false;
    getApplicationDocuments(applicationId)
      .then((data) => {
        if (cancelled) return;
        setDocuments([...data].sort((a, b) => b.created_at.localeCompare(a.created_at)));
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load documents'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const handleUpload = async (data: DocumentUploadData) => {
    try {
      setSubmitting(true);
      setFormError(null);
      await uploadApplicationDocument(applicationId, data);
      toast.success('Document uploaded');
      setUploading(false);
      reload();
    } catch (err: any) {
      if (!isAuthError(err)) setFormError(getApiErrorMessage(err, 'Failed to upload document'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (document: ApplicationDocument) => {
    try {
      setBusyId(document.document_id);
      await verifyApplicationDocument(applicationId, document.document_id);
      toast.success('Document verified');
      reload();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to verify document'));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejecting) return;
    try {
      setSubmitting(true);
      setFormError(null);
      await rejectApplicationDocument(applicationId, rejecting.document_id, reason);
      toast.success('Document rejected');
      setRejecting(null);
      reload();
    } catch (err: any) {
      if (!isAuthError(err)) setFormError(getApiErrorMessage(err, 'Failed to reject document'));
    } finally {
      setSubmitting(false);
    }
  };

  // Preview opens the file in a new tab. The tab is opened synchronously (before
  // the request) so the browser doesn't treat it as a blocked popup.
  const handleView = async (document: ApplicationDocument) => {
    const tab = window.open('', '_blank');
    try {
      setBusyId(document.document_id);
      const { blob } = await downloadApplicationDocument(applicationId, document.document_id);
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err: any) {
      tab?.close();
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to open document'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (doc: ApplicationDocument) => {
    try {
      setBusyId(doc.document_id);
      const { blob, filename } = await downloadApplicationDocument(applicationId, doc.document_id);
      saveBlob(blob, filename ?? doc.file_name ?? `document-${doc.document_id}`);
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to download document'));
    } finally {
      setBusyId(null);
    }
  };

  const canUpdate = can('update');

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Documents{documents.length > 0 && <span className="ml-2 text-sm font-normal text-slate-500">({documents.length})</span>}
          </h2>
          {ready && can('create') && !uploading && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setUploading(true);
                setFormError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          )}
        </div>

        {/* View-only admins already get the page-level notice. */}
        {ready && !can('create') && !isViewOnlyAdmin && <AccessNotice isViewOnlyAdmin={false} />}

        {uploading && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <DocumentUploadForm
              submitting={submitting}
              error={formError}
              onSubmit={handleUpload}
              onCancel={() => setUploading(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : documents.length === 0 ? (
          <div className="text-center text-slate-500 py-4">No documents uploaded yet</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {documents.map((document) => {
              const busy = busyId === document.document_id;
              const details = [
                document.file_name,
                formatFileSize(document.file_size),
                `Uploaded ${formatDate(document.created_at)}`,
              ].filter(Boolean);
              return (
                <li key={document.document_id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900 capitalize">{formatLabel(document.document_type)}</span>
                        <DocumentStatusBadge status={document.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 break-all">{details.join(' · ')}</p>
                      {document.status === 'rejected' && document.rejection_reason && (
                        <p className="mt-1 text-sm text-red-600 break-words">Rejected: {document.rejection_reason}</p>
                      )}
                      {document.status === 'verified' && document.verified_at && (
                        <p className="mt-1 text-xs text-green-700">Verified {formatDate(document.verified_at)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" title="View" disabled={busy} onClick={() => handleView(document)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Download" disabled={busy} onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {canUpdate && document.status !== 'verified' && (
                      <Button variant="ghost" size="sm" title="Verify" disabled={busy} onClick={() => handleVerify(document)}>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {canUpdate && document.status !== 'rejected' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Reject"
                        disabled={busy}
                        onClick={() => {
                          setRejecting(document);
                          setFormError(null);
                        }}
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {rejecting && (
        <ReasonModal
          key={rejecting.document_id}
          title="Reject Document"
          description={
            <>
              Tell the applicant why{' '}
              <span className="font-medium text-slate-900 capitalize">{rejecting.document_type}</span> was rejected.
            </>
          }
          placeholder="e.g. Image is blurred — please re-upload a clear scan"
          submitLabel="Reject Document"
          submittingLabel="Rejecting..."
          submitting={submitting}
          error={formError}
          onSubmit={handleReject}
          onClose={() => setRejecting(null)}
        />
      )}
    </Card>
  );
}
