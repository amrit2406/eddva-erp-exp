import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import GroupForm from '../../components/groups/GroupForm';
import { createGroup } from '../../api/groups.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { GroupFormData } from '../../types/engagement.types';

const EMPTY: GroupFormData = { name: '', group_type: '', description: '' };

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('groups');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: GroupFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const group = await createGroup(data);
      toast.success('Group created');
      navigate(`/alumni/groups/${group.group_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create group'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Group</h1>
        <p className="text-slate-600 mt-1">Create an alumni group</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <GroupForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Group"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/groups')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
