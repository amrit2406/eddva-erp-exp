import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import TestForm from '../../components/tests/TestForm';
import { createTest } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { TESTS_RESOURCE } from '../../utils/tests';
import type { TestFormData } from '../../types/admission.types';

const EMPTY: TestFormData = {
  name: '',
  session_id: '',
  program_id: '',
  test_date: '',
  mode: 'offline',
  venue: '',
  max_marks: '',
};

export default function CreateTestPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(TESTS_RESOURCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TestFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await createTest(data);
      toast.success('Entrance test created');
      navigate(created?.test_id ? `/admission/tests/${created.test_id}` : '/admission/tests');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create test'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Entrance Test</h1>
        <p className="text-slate-600 mt-1">Schedule a test for a session and program</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <TestForm
              initialValues={EMPTY}
              defaultToActiveSession
              submitting={submitting}
              error={error}
              submitLabel="Create Test"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/tests')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
