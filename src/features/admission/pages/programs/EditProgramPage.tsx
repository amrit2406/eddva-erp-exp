import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ProgramForm from '../../components/programs/ProgramForm';
import { getProgram, updateProgram } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { ProgramFormData } from '../../types/admission.types';

export default function EditProgramPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('programs');
  const [initial, setInitial] = useState<ProgramFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProgram(id)
      .then((program) => {
        if (cancelled) return;
        setInitial({
          name: program.name,
          level: program.level,
          total_seats: program.total_seats,
          eligibility_criteria: program.eligibility_criteria ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load program'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: ProgramFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateProgram(id, data);
      toast.success('Program updated');
      navigate('/admission/programs');
    } catch (err: any) {
      // e.g. seats can't drop below seats already held by offers/admissions
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update program'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Program</h1>
        <p className="text-slate-600 mt-1">Update program details and available seats</p>
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
            <ProgramForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Program"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/programs')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
