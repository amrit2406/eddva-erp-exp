import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import BlockForm from '../../components/blocks/BlockForm';
import { createBlock } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { BlockFormData } from '../../types/hostel.types';

const EMPTY: BlockFormData = {
  name: '',
  gender_type: '',
  total_floors: NaN,
  warden_user_id: '',
  description: '',
  is_active: true,
};

export default function CreateBlockPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('blocks');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BlockFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createBlock(data);
      toast.success('Block created');
      navigate('/hostel/blocks');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create block'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Block</h1>
        <p className="text-slate-600 mt-1">Create a hostel building</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <BlockForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Block"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/blocks')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
