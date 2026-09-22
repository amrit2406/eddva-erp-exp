import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MentorshipProgramForm from '../../components/mentorship-programs/MentorshipProgramForm';
import { createMentorshipProgram } from '../../api/mentorshipPrograms.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { MentorshipProgramFormData } from '../../types/mentorship.types';

const EMPTY: MentorshipProgramFormData = { name: '', description: '', start_date: '', end_date: '' };

export default function CreateMentorshipProgramPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('mentorship_programs');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: MentorshipProgramFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const program = await createMentorshipProgram(data);
      toast.success('Program created');
      navigate(`/alumni/mentorship-programs/${program.program_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create program'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Mentorship Program</h1>
        <p className="text-slate-600 mt-1">Create a mentor-mentee program</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <MentorshipProgramForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Program"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/mentorship-programs')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
