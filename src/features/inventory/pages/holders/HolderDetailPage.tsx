import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Phone, Hash, ClipboardList } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { getHolder, getHolderCurrentIssues } from '../../api/holders.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryHolder, InventoryHolderCurrentIssue } from '../../types/holder.types';
import { cn } from '../../../../utils/cn';

const TYPE_STYLE: Record<string, string> = {
  staff: 'bg-blue-100 text-blue-700',
  student: 'bg-purple-100 text-purple-700',
  department: 'bg-amber-100 text-amber-700',
};

const ISSUE_STATUS_STYLE: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-700',
  issued: 'bg-blue-100 text-blue-700',
  partially_returned: 'bg-purple-100 text-purple-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function HolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [holder, setHolder] = useState<InventoryHolder | null>(null);
  const [currentIssues, setCurrentIssues] = useState<InventoryHolderCurrentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [holderData, issuesData] = await Promise.all([getHolder(id), getHolderCurrentIssues(id)]);
      setHolder(holderData);
      setCurrentIssues(issuesData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load holder'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!holder) return <div className="text-center py-8 text-slate-500">Holder not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/inventory/holders" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Holders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {holder.name}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                holder.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {holder.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="text-slate-600 mt-1 capitalize">{holder.holder_type}</p>
        </div>
        <Link to={`/inventory/holders/${holder.holder_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Holder
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Type</p>
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize mt-1',
              TYPE_STYLE[holder.holder_type] ?? 'bg-slate-100 text-slate-600'
            )}
          >
            {holder.holder_type}
          </span>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" /> Reference ID
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{holder.external_ref_id || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Contact Phone
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{holder.contact_phone || '—'}</p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Currently Held Items
          </h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Item</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Qty</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Source Location</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Issue Date</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentIssues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Nothing currently issued to this holder.
                    </td>
                  </tr>
                ) : (
                  currentIssues.map((issue) => (
                    <tr key={issue.issue_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          {issue.item?.name ?? `#${issue.item_id}`}
                          {issue.asset_unit && <span className="text-xs text-slate-500 font-mono">{issue.asset_unit.asset_tag}</span>}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {issue.quantity_returned}/{issue.quantity}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">{issue.source_location?.name ?? `#${issue.source_location_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(issue.issue_date).toLocaleDateString()}</td>
                      <td className="py-2 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                            ISSUE_STATUS_STYLE[issue.status] ?? 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
