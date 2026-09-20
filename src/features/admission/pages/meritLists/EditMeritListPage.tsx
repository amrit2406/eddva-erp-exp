import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MeritListForm from '../../components/meritLists/MeritListForm';
import { getMeritList, updateMeritList } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { MERIT_LISTS_RESOURCE } from '../../utils/meritLists';
import type { MeritList, MeritListFormData } from '../../types/admission.types';

export default function EditMeritListPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(MERIT_LISTS_RESOURCE);
  const { nameOf: sessionName } = useSessionOptions();
  const { nameOf: programName } = useProgramOptions();
  const [list, setList] = useState<MeritList | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMeritList(id)
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load merit list'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: MeritListFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMeritList(id, data);
      toast.success('Merit list updated');
      navigate(`/admission/merit-lists/${id}`);
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update merit list'));
    } finally {
      setSubmitting(false);
    }
  };

  const scopeSummary = list
    ? `${list.session?.name ?? sessionName(list.session_id) ?? `Session #${list.session_id}`} · ${
        list.program?.name ?? programName(list.program_id) ?? `Program #${list.program_id}`
      }`
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Merit List</h1>
        <p className="text-slate-600 mt-1">Rename the list or change its selection criteria</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !list ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <MeritListForm
              mode="edit"
              initialValues={{
                name: list.name,
                session_id: list.session_id,
                program_id: list.program_id,
                criteria_description: list.criteria_description ?? '',
              }}
              scopeSummary={scopeSummary}
              submitting={submitting}
              error={error}
              submitLabel="Update Merit List"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admission/merit-lists/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
