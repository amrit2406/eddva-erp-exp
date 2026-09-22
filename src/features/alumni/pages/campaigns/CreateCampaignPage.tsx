import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import CampaignForm from '../../components/campaigns/CampaignForm';
import { createCampaign } from '../../api/campaigns.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { CampaignFormData } from '../../types/fundraising.types';

const EMPTY: CampaignFormData = { title: '', description: '', goal_amount: '', start_date: '', end_date: '' };

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('campaigns');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CampaignFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const campaign = await createCampaign(data);
      toast.success('Campaign created');
      navigate(`/alumni/campaigns/${campaign.campaign_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create campaign'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Campaign</h1>
        <p className="text-slate-600 mt-1">Start a new fundraising campaign</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <CampaignForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Campaign"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/campaigns')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
