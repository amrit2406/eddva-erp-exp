import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import BlockForm from '../../components/blocks/BlockForm';
import { getBlock, updateBlock } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { BlockFormData } from '../../types/hostel.types';

export default function EditBlockPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('blocks');
  const [initial, setInitial] = useState<BlockFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getBlock(id)
      .then((block) => {
        if (cancelled) return;
        setInitial({
          name: block.name,
          gender_type: block.gender_type,
          total_floors: block.total_floors,
          warden_user_id: block.warden_user_id ?? '',
          description: block.description ?? '',
          is_active: block.is_active,
        });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load block'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: BlockFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateBlock(id, data);
      toast.success('Block updated');
      navigate(`/hostel/blocks/${id}`);
    } catch (err) {
      // e.g. total floors can't drop below floors that already have rooms
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update block'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Block</h1>
        <p className="text-slate-600 mt-1">Update block details</p>
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
            <BlockForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Block"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/hostel/blocks/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
