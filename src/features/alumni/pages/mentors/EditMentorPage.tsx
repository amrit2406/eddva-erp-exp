import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MentorForm from '../../components/mentors/MentorForm';
import { getMentor, updateMentor } from '../../api/mentors.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { MentorFormData } from '../../types/mentorship.types';

export default function EditMentorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('mentors');
  const [initial, setInitial] = useState<MentorFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMentor(id)
      .then((mentor) => {
        if (cancelled) return;
        setInitial({
          alumni_id: String(mentor.alumni_id),
          expertise_areas: mentor.expertise_areas.join(', '),
          max_mentees: String(mentor.max_mentees),
          bio: mentor.bio ?? '',
          availability_note: mentor.availability_note ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load mentor'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: MentorFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMentor(id, data);
      toast.success('Mentor updated');
      navigate('/alumni/mentors');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update mentor'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Mentor</h1>
        <p className="text-slate-600 mt-1">Update mentor details</p>
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
            <MentorForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Mentor"
              submittingLabel="Updating..."
              lockAlumni
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/mentors')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
