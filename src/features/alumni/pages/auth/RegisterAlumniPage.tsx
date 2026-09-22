import { useState } from 'react';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ProfileForm from '../../components/profiles/ProfileForm';
import { registerAlumniAccount } from '../../api/auth.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniRegisterFormData } from '../../types/profile.types';

const EMPTY: AlumniRegisterFormData = {
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
  verification_note: '',
};

// Staff onboard an alumnus and their portal login together — alumni never
// self-register, since nothing here can prove ownership of an email address.
export default function RegisterAlumniPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('alumni');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleSubmit = async (data: AlumniRegisterFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await registerAlumniAccount(data);
      toast.success('Alumni account created');
      // No alumni directory list exists yet to navigate to — reset the form
      // for the next registration instead.
      setResetKey((key) => key + 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create alumni account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register Alumni</h1>
        <p className="text-slate-600 mt-1">Create an alumni profile and portal login together</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !(can('create') && can('issue_account')) ? (
            <AccessNotice />
          ) : (
            <ProfileForm
              key={resetKey}
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Alumni Account"
              submittingLabel="Creating..."
              showPassword
              showVerificationStatus
              showVerificationNote
              onSubmit={(data) => handleSubmit(data as AlumniRegisterFormData)}
              onCancel={() => setResetKey((key) => key + 1)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
