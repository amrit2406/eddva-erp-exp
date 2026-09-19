import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import SessionForm from '../../components/sessions/SessionForm';
import { getSession, updateSession } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { toDateInput } from '../../utils/format';
import type { SessionFormData } from '../../types/admission.types';

export default function EditSessionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('sessions');
  const [initial, setInitial] = useState<SessionFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getSession(id)
      .then((session) => {
        if (cancelled) return;
        setInitial({
          name: session.name,
          start_date: toDateInput(session.start_date),
          end_date: toDateInput(session.end_date),
          status: session.status,
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load session'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: SessionFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateSession(id, data);
      toast.success('Academic session updated');
      navigate('/admission/sessions');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update session'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Academic Session</h1>
        <p className="text-slate-600 mt-1">Update dates or change the session status</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <SessionForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Session"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/sessions')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
