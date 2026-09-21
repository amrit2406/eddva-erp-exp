import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import FeePlanForm from '../../components/fee-plans/FeePlanForm';
import { getFeePlan, updateFeePlan } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { FEE_PLANS_RESOURCE } from '../../utils/feePlans';
import type { FeePlanFormData } from '../../types/hostel.types';

export default function EditFeePlanPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(FEE_PLANS_RESOURCE);
  const [initial, setInitial] = useState<FeePlanFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getFeePlan(id)
      .then((plan) => {
        if (cancelled) return;
        setInitial({
          name: plan.name,
          room_type: plan.room_type,
          includes_mess: !!plan.includes_mess,
          amount: Number(plan.amount),
          billing_cycle: plan.billing_cycle,
          description: plan.description ?? '',
          is_active: plan.is_active !== false,
        });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load fee plan'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: FeePlanFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateFeePlan(id, data);
      toast.success('Fee plan updated');
      navigate('/hostel/fee-plans');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update fee plan'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Fee Plan</h1>
        <p className="text-slate-600 mt-1">Update the plan's price, billing cycle or availability</p>
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
            <FeePlanForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Fee Plan"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/fee-plans')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
