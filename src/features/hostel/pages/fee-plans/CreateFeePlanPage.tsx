import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import FeePlanForm from '../../components/fee-plans/FeePlanForm';
import { createFeePlan } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { FEE_PLANS_RESOURCE } from '../../utils/feePlans';
import type { FeePlanFormData } from '../../types/hostel.types';

const EMPTY: FeePlanFormData = {
  name: '',
  room_type: '',
  includes_mess: false,
  amount: NaN,
  billing_cycle: 'monthly',
  description: '',
  is_active: true,
};

export default function CreateFeePlanPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(FEE_PLANS_RESOURCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FeePlanFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createFeePlan(data);
      toast.success('Fee plan created');
      navigate('/hostel/fee-plans');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create fee plan'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Fee Plan</h1>
        <p className="text-slate-600 mt-1">Set what a kind of room costs and how often it is billed</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <FeePlanForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Fee Plan"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/fee-plans')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
