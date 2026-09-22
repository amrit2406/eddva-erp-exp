import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ProfileForm from '../../components/profiles/ProfileForm';
import { createProfile } from '../../api/profiles.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniProfileFormData } from '../../types/profile.types';

const EMPTY: AlumniProfileFormData = {
  full_name: '',
  email: '',
  student_ref: '',
  admission_no: '',
  batch_year: NaN,
  graduation_year: NaN,
  program: '',
  phone: '',
  current_company: '',
  current_designation: '',
  industry: '',
  city: '',
  country: '',
  linkedin_url: '',
  visibility: 'alumni_only',
  contact_visible: true,
  email_opt_in: true,
  sms_opt_in: true,
  verification_status: 'pending',
  password: '',
};

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('alumni');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AlumniProfileFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const profile = await createProfile(data);
      toast.success('Alumni profile created');
      navigate(`/alumni/profiles/${profile.profile_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create profile'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Alumni Profile</h1>
        <p className="text-slate-600 mt-1">Create a profile and its portal login together</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <ProfileForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Profile"
              submittingLabel="Creating..."
              showPassword
              showVerificationStatus
              onSubmit={(data) => handleSubmit(data as AlumniProfileFormData)}
              onCancel={() => navigate('/alumni/profiles')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
