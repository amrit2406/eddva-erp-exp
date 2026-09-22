import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { getCampaigns } from '../../api/campaigns.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import type { Pagination } from '../../types/profile.types';
import type { Campaign } from '../../types/fundraising.types';

const PAGE_SIZE = 20;

export default function CampaignsPage() {
  const { can, ready } = useResourceAccess('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCampaigns({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setCampaigns(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load campaigns'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fundraising Campaigns</h1>
          <p className="text-slate-600 mt-1">Donation drives run for the school</p>
        </div>
        {can('create') && (
          <Link to="/alumni/campaigns/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Goal</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Runs</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.campaign_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/alumni/campaigns/${campaign.campaign_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {campaign.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600">₹{campaign.goal_amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                          {formatValue('start_date', campaign.start_date)} – {formatValue('end_date', campaign.end_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{campaign.status || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {can('update') && (
                              <Link to={`/alumni/campaigns/${campaign.campaign_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
