import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import SessionForm from '../../components/sessions/SessionForm';
import { createSession } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { SessionFormData } from '../../types/admission.types';

const EMPTY: SessionFormData = { name: '', start_date: '', end_date: '', status: 'upcoming' };

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('sessions');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SessionFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createSession(data);
      toast.success('Academic session created');
      navigate('/admission/sessions');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create session'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Academic Session</h1>
        <p className="text-slate-600 mt-1">Create a new admission cycle</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <SessionForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Session"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/sessions')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
