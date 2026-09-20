import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import EnquiryActionsPanel from '../../components/enquiries/EnquiryActionsPanel';
import EnquiryStatusBadge from '../../components/enquiries/EnquiryStatusBadge';
import FollowupsPanel from '../../components/enquiries/FollowupsPanel';
import { deleteEnquiry, getEnquiry } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate, formatLabel } from '../../utils/format';
import type { Enquiry } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

export default function EnquiryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('enquiries');
  const { nameOf } = useProgramOptions();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getEnquiry(id)
      .then((data) => {
        if (cancelled) return;
        setEnquiry(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load enquiry'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleDelete = async () => {
    if (!enquiry) return;
    if (!window.confirm(`Delete the enquiry from "${enquiry.name}"? Its follow-ups will be lost too.`)) return;
    try {
      await deleteEnquiry(enquiry.enquiry_id);
      toast.success('Enquiry deleted');
      navigate('/admission/enquiries');
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete enquiry'));
    }
  };

  const backLink = (
    <Link to="/admission/enquiries" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All enquiries
    </Link>
  );

  if (loadError) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{loadError}</div>
        </Card>
      </div>
    );
  }

  if (!enquiry || !ready) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  const canUpdate = can('update');
  const programName =
    enquiry.program?.name ?? nameOf(enquiry.program_id) ?? (enquiry.program_id ? `Program #${enquiry.program_id}` : '—');

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{enquiry.name}</h1>
          <EnquiryStatusBadge status={enquiry.status} />
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Link to={`/admission/enquiries/${enquiry.enquiry_id}/edit`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          {can('delete') && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {!canUpdate && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
              <dl className="space-y-4">
                <Detail label="Phone">{enquiry.phone || '—'}</Detail>
                <Detail label="Email">{enquiry.email || '—'}</Detail>
                <Detail label="Program of Interest">{programName}</Detail>
                <Detail label="Source"><span className="capitalize">{formatLabel(enquiry.source)}</span></Detail>
                <Detail label="Received">{formatDate(enquiry.created_at)}</Detail>
              </dl>
            </div>
          </Card>

          <EnquiryActionsPanel
            key={`${enquiry.status}|${enquiry.assigned_to ?? ''}`}
            enquiry={enquiry}
            canUpdate={canUpdate}
            onChanged={() => setReloadKey((key) => key + 1)}
          />
        </div>

        <div className="lg:col-span-2">
          <FollowupsPanel enquiryId={enquiry.enquiry_id} canUpdate={canUpdate} />
        </div>
      </div>
    </div>
  );
}
