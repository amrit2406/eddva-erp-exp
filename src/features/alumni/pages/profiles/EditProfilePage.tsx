import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ProfileForm from '../../components/profiles/ProfileForm';
import { getProfile, updateProfile } from '../../api/profiles.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniProfileFormData, AlumniProfileUpdateData } from '../../types/profile.types';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('alumni');
  const [initial, setInitial] = useState<AlumniProfileFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProfile(id)
      .then((profile) => {
        if (cancelled) return;
        setInitial({ ...profile, password: '' });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load profile'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: AlumniProfileUpdateData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateProfile(id, data);
      toast.success('Profile updated');
      navigate(`/alumni/profiles/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Alumni Profile</h1>
        <p className="text-slate-600 mt-1">Update profile details</p>
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
            <ProfileForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Profile"
              submittingLabel="Updating..."
              showVerificationStatus
              onSubmit={(data) => handleSubmit(data)}
              onCancel={() => navigate(`/alumni/profiles/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
