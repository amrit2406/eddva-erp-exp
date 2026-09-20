import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MeritListForm from '../../components/meritLists/MeritListForm';
import { createMeritList } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { MERIT_LISTS_RESOURCE, toPayloadEntries } from '../../utils/meritLists';
import type { MeritEntryDraft, MeritListFormData } from '../../types/admission.types';

const EMPTY: MeritListFormData = { name: '', session_id: '', program_id: '', criteria_description: '' };

export default function CreateMeritListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(MERIT_LISTS_RESOURCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: MeritListFormData, entries: MeritEntryDraft[]) => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await createMeritList(data, toPayloadEntries(entries));
      toast.success('Merit list created');
      navigate(created?.merit_list_id ? `/admission/merit-lists/${created.merit_list_id}` : '/admission/merit-lists');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create merit list'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Merit List</h1>
        <p className="text-slate-600 mt-1">Rank applications for a session and program</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <MeritListForm
              mode="create"
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Merit List"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/merit-lists')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
