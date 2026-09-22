import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MentorForm from '../../components/mentors/MentorForm';
import { createMentor } from '../../api/mentors.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { MentorFormData } from '../../types/mentorship.types';

const EMPTY: MentorFormData = { alumni_id: '', expertise_areas: '', max_mentees: '3', bio: '', availability_note: '' };

export default function CreateMentorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('mentors');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: MentorFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createMentor(data);
      toast.success('Mentor added');
      navigate('/alumni/mentors');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add mentor'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Mentor</h1>
        <p className="text-slate-600 mt-1">Register an alumnus as a mentor</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <MentorForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Add Mentor"
              submittingLabel="Adding..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/mentors')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
