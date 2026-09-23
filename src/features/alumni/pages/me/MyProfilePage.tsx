import { useEffect, useRef, useState } from 'react';
import Card from '../../../../components/ui/Card';
import ProfileForm from '../../components/profiles/ProfileForm';
import PhotoUploader from '../../components/profiles/PhotoUploader';
import VerificationBadge from '../../components/profiles/VerificationBadge';
import { getMyPhotoUrl, getMyProfile, updateMyProfile, uploadMyPhoto } from '../../api/me.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniProfile, AlumniProfileFormData, AlumniProfileUpdateData } from '../../types/profile.types';

// This is the self-service view for whoever the current Alumni session
// belongs to. In this staff admin app that's normally an officer's account
// rather than an alumnus, so this page will usually show a "failed to load"
// error here — it's built for reuse by an alumni-facing portal.
export default function MyProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // getMyPhotoUrl hands back an object URL (blob:...) when the endpoint
  // serves the raw image; it must be revoked once replaced or unmounted.
  const objectUrlRef = useRef<string | null>(null);

  const load = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load your profile'));
    }
  };

  const loadPhoto = async () => {
    const url = await getMyPhotoUrl();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = url?.startsWith('blob:') ? url : null;
    setPhotoUrl(url);
  };

  useEffect(() => {
    load();
    loadPhoto();
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleSubmit = async (data: AlumniProfileUpdateData) => {
    try {
      setSubmitting(true);
      setError(null);
      const updated = await updateMyProfile(data);
      setProfile(updated);
      toast.success('Profile updated');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update your profile'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-1">The alumni portal profile for the current Alumni session</p>
      </div>

      {loadError ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{loadError}</div>
        </Card>
      ) : !profile ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <>
          <Card className="border-slate-200">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <PhotoUploader
                currentPhotoUrl={photoUrl}
                onUpload={async (file) => {
                  await uploadMyPhoto(file);
                  toast.success('Photo updated');
                  // The photo isn't part of GET /alumni/me — this is the
                  // dedicated (undocumented but mirrored from the Directory
                  // endpoint) source of truth for display.
                  await loadPhoto();
                }}
              />
              <VerificationBadge status={profile.verification_status} />
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <ProfileForm
                initialValues={{ ...profile, password: '' } as AlumniProfileFormData}
                submitting={submitting}
                error={error}
                submitLabel="Save Changes"
                submittingLabel="Saving..."
                onSubmit={(data) => handleSubmit(data)}
                onCancel={load}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
