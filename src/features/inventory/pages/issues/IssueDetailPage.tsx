import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Check, X, RotateCcw, RefreshCcw } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import RejectIssueModal from '../../components/issues/RejectIssueModal';
import ReturnIssueModal from '../../components/issues/ReturnIssueModal';
import { getIssue, approveIssue, rejectIssue, returnIssue } from '../../api/issues.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryIssue, InventoryReturnFormData, InventoryRejectFormData } from '../../types/issue.types';
import { cn } from '../../../../utils/cn';

const STATUS_STYLE: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-700',
  issued: 'bg-blue-100 text-blue-700',
  partially_returned: 'bg-purple-100 text-purple-700',
  returned: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  rejected: 'bg-slate-200 text-slate-600',
};

const RETURNABLE_STATUSES = new Set(['issued', 'partially_returned', 'overdue']);

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<InventoryIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getIssue(id);
      setIssue(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load issue'));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!id) return;
    setActionError(null);
    try {
      await approveIssue(id);
      await load();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setActionError(getApiErrorMessage(err, 'Failed to approve issue'));
    }
  }

  async function handleReject(data: InventoryRejectFormData) {
    if (!id) return;
    setSubmitting(true);
    try {
      await rejectIssue(id, data);
      setIsRejectOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn(data: InventoryReturnFormData) {
    if (!id) return;
    setSubmitting(true);
    try {
      await returnIssue(id, data);
      setIsReturnOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!issue) return <div className="text-center py-8 text-slate-500">Issue not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/inventory/issues" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Issues
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Issue #{issue.issue_id}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                STATUS_STYLE[issue.status] ?? 'bg-slate-100 text-slate-600'
              )}
            >
              {issue.status.replace('_', ' ')}
            </span>
          </h1>
          <p className="text-slate-600 mt-1">{new Date(issue.issue_date).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          {issue.status === 'pending_approval' && (
            <>
              <Button variant="primary" onClick={handleApprove}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="secondary" onClick={() => setIsRejectOpen(true)}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {RETURNABLE_STATUSES.has(issue.status) && (
            <Button variant="secondary" onClick={() => setIsReturnOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Return
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{actionError}</div>
      )}

      {issue.status === 'rejected' && issue.rejection_reason && (
        <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm">
          <span className="font-medium">Rejection reason:</span> {issue.rejection_reason}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Item
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {issue.item?.name ?? `#${issue.item_id}`}
            {issue.asset_unit && <span className="block text-xs text-slate-500 font-mono">{issue.asset_unit.asset_tag}</span>}
          </p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Holder
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">
            {issue.holder ? `${issue.holder.name} (${issue.holder.holder_type})` : `#${issue.holder_id}`}
          </p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Source Location
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{issue.source_location?.name ?? `#${issue.source_location_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Quantity</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {issue.quantity_returned} / {issue.quantity} returned
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Expected Return Date</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {issue.expected_return_date ? new Date(issue.expected_return_date).toLocaleDateString() : '—'}
          </p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Approval Status</p>
          <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">{issue.approval_status.replace('_', ' ')}</p>
        </Card>
      </div>

      {issue.returns && issue.returns.length > 0 && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <RefreshCcw className="h-5 w-5 text-blue-600" />
              Return History
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Condition</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {issue.returns.map((r) => (
                    <tr key={r.return_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(r.return_date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 text-sm text-slate-900">{r.quantity_returned}</td>
                      <td className="py-2 px-4 text-sm text-slate-600 capitalize">{r.condition}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{r.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      <RejectIssueModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onSubmit={handleReject}
        isLoading={submitting}
      />
      <ReturnIssueModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        issue={issue}
        onSubmit={handleReturn}
        isLoading={submitting}
      />
    </div>
  );
}
