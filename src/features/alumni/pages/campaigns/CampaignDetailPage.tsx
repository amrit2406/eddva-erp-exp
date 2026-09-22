import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Pencil, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { closeCampaign, getCampaign, getCampaignDonations, getCampaignStatistics } from '../../api/campaigns.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import { recordId } from '../../utils/records';
import type { Campaign } from '../../types/fundraising.types';
import type { GenericRecord, ListParams } from '../../types/profile.types';

type Tab = 'statistics' | 'donations';

const TABS: { key: Tab; label: string }[] = [
  { key: 'statistics', label: 'Statistics' },
  { key: 'donations', label: 'Donations' },
];

const donationHref = (row: GenericRecord) => {
  const id = recordId(row, 'donation_id');
  return id ? `/alumni/donations/${id}` : undefined;
};

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('campaigns');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('statistics');

  const reload = async () => {
    if (!id) return;
    setCampaign(await getCampaign(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getCampaign(id)
      .then((data) => {
        if (!cancelled) setCampaign(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load campaign'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadStatistics = useCallback(() => getCampaignStatistics(id!), [id]);
  const loadDonations = useCallback((params: ListParams) => getCampaignDonations(id!, params), [id]);

  const handleClose = async () => {
    if (!id || !window.confirm('Close this campaign?')) return;
    try {
      await closeCampaign(id);
      toast.success('Campaign closed');
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to close campaign'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const isClosed = campaign.status?.toLowerCase() === 'closed';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/campaigns" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
            <p className="text-slate-600 mt-1">
              Goal ₹{campaign.goal_amount.toLocaleString()} · {formatValue('start_date', campaign.start_date)} –{' '}
              {formatValue('end_date', campaign.end_date)}
              {campaign.status ? ` · ${campaign.status}` : ''}
            </p>
            {campaign.description && <p className="text-slate-600 mt-1 max-w-2xl">{campaign.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {can('create') && (
              <Link to={`/alumni/donations/new?campaign_id=${campaign.campaign_id}`}>
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Donation
                </Button>
              </Link>
            )}
            {!isClosed && can('update') && (
              <Link to={`/alumni/campaigns/${campaign.campaign_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {!isClosed && can('update') && (
              <Button variant="ghost" onClick={handleClose}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Close Campaign
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'statistics' && (
          <RecordPanel key="statistics" load={loadStatistics} emptyMessage="No statistics available" />
        )}
        {tab === 'donations' && (
          <RecordPanel key="donations" load={loadDonations} emptyMessage="No donations yet" rowHref={donationHref} />
        )}
      </Card>
    </div>
  );
}
