import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import FeeStructureForm from '../../components/feeStructures/FeeStructureForm';
import { getFeeStructure, updateFeeStructure } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { FEE_STRUCTURES_RESOURCE } from '../../utils/feeStructures';
import { toDateInput } from '../../utils/format';
import type { FeeStructure, FeeStructureFormData } from '../../types/admission.types';

export default function EditFeeStructurePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(FEE_STRUCTURES_RESOURCE);
  const { nameOf: sessionName } = useSessionOptions();
  const { nameOf: programName } = useProgramOptions();
  const [structure, setStructure] = useState<FeeStructure | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getFeeStructure(id)
      .then((data) => {
        if (!cancelled) setStructure(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load fee structure'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: FeeStructureFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateFeeStructure(id, data);
      toast.success('Fee structure updated');
      navigate('/admission/fee-structures');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update fee structure'));
    } finally {
      setSubmitting(false);
    }
  };

  const scopeSummary = structure
    ? `${structure.program?.name ?? programName(structure.program_id) ?? `Program #${structure.program_id}`} · ${
        structure.session?.name ?? sessionName(structure.session_id) ?? `Session #${structure.session_id}`
      }`
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Fee Structure</h1>
        <p className="text-slate-600 mt-1">Update the amount or due date</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !structure ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <FeeStructureForm
              mode="edit"
              initialValues={{
                program_id: structure.program_id,
                session_id: structure.session_id,
                amount: Number(structure.amount),
                due_date: toDateInput(structure.due_date),
              }}
              scopeSummary={scopeSummary}
              submitting={submitting}
              error={error}
              submitLabel="Update Fee Structure"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/fee-structures')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
