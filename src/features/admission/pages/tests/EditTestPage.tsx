import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import TestForm from '../../components/tests/TestForm';
import { getTest, updateTest } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { toDateTimeInput } from '../../utils/format';
import { TESTS_RESOURCE } from '../../utils/tests';
import type { TestFormData } from '../../types/admission.types';

export default function EditTestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(TESTS_RESOURCE);
  const [initial, setInitial] = useState<TestFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getTest(id)
      .then((test) => {
        if (cancelled) return;
        setInitial({
          name: test.name,
          session_id: test.session_id,
          program_id: test.program_id,
          test_date: toDateTimeInput(test.test_date),
          mode: test.mode,
          venue: test.venue ?? '',
          max_marks: Number(test.max_marks),
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load test'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: TestFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateTest(id, data);
      toast.success('Entrance test updated');
      navigate(`/admission/tests/${id}`);
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update test'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Entrance Test</h1>
        <p className="text-slate-600 mt-1">Update the schedule, venue or maximum marks</p>
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
            <TestForm
              initialValues={initial}
              defaultToActiveSession={false}
              submitting={submitting}
              error={error}
              submitLabel="Update Test"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admission/tests/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
