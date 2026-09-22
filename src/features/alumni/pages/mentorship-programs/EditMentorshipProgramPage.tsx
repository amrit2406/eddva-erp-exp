import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MentorshipProgramForm from '../../components/mentorship-programs/MentorshipProgramForm';
import { getMentorshipProgram, updateMentorshipProgram } from '../../api/mentorshipPrograms.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { MentorshipProgramFormData } from '../../types/mentorship.types';

export default function EditMentorshipProgramPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('mentorship_programs');
  const [initial, setInitial] = useState<MentorshipProgramFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMentorshipProgram(id)
      .then((program) => {
        if (cancelled) return;
        setInitial({
          name: program.name,
          description: program.description ?? '',
          start_date: program.start_date?.slice(0, 10) ?? '',
          end_date: program.end_date?.slice(0, 10) ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load program'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: MentorshipProgramFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMentorshipProgram(id, data);
      toast.success('Program updated');
      navigate(`/alumni/mentorship-programs/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update program'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Mentorship Program</h1>
        <p className="text-slate-600 mt-1">Update program details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice />
          ) : (
            <MentorshipProgramForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Program"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/alumni/mentorship-programs/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
