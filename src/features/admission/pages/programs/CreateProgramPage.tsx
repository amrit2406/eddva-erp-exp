import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ProgramForm from '../../components/programs/ProgramForm';
import { createProgram } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { ProgramFormData } from '../../types/admission.types';

const EMPTY: ProgramFormData = { name: '', level: '', total_seats: NaN, eligibility_criteria: '' };

export default function CreateProgramPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('programs');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createProgram(data);
      toast.success('Program created');
      navigate('/admission/programs');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create program'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Program</h1>
        <p className="text-slate-600 mt-1">Create a class or course applicants can be admitted into</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <ProgramForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Program"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/programs')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
