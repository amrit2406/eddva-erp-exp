import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import FeeStructureForm from '../../components/feeStructures/FeeStructureForm';
import { createFeeStructure } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { FEE_STRUCTURES_RESOURCE } from '../../utils/feeStructures';
import type { FeeStructureFormData } from '../../types/admission.types';

const EMPTY: FeeStructureFormData = { program_id: '', session_id: '', amount: '', due_date: '' };

export default function CreateFeeStructurePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(FEE_STRUCTURES_RESOURCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FeeStructureFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createFeeStructure(data);
      toast.success('Fee structure created');
      navigate('/admission/fee-structures');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create fee structure'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Fee Structure</h1>
        <p className="text-slate-600 mt-1">Set the admission fee and due date for a program and session</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <FeeStructureForm
              mode="create"
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Fee Structure"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/fee-structures')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
