import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import CampaignForm from '../../components/campaigns/CampaignForm';
import { getCampaign, updateCampaign } from '../../api/campaigns.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { CampaignFormData } from '../../types/fundraising.types';

export default function EditCampaignPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('campaigns');
  const [initial, setInitial] = useState<CampaignFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getCampaign(id)
      .then((campaign) => {
        if (cancelled) return;
        setInitial({
          title: campaign.title,
          description: campaign.description ?? '',
          goal_amount: String(campaign.goal_amount),
          start_date: campaign.start_date?.slice(0, 10) ?? '',
          end_date: campaign.end_date?.slice(0, 10) ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load campaign'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: CampaignFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateCampaign(id, data);
      toast.success('Campaign updated');
      navigate(`/alumni/campaigns/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update campaign'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Campaign</h1>
        <p className="text-slate-600 mt-1">Update campaign details</p>
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
            <CampaignForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Campaign"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/alumni/campaigns/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
