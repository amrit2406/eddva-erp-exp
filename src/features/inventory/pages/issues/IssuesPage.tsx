import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import IssuesTabs from '../../components/issues/IssuesTabs';
import IssueTable from '../../components/issues/IssueTable';
import RejectIssueModal from '../../components/issues/RejectIssueModal';
import ReturnIssueModal from '../../components/issues/ReturnIssueModal';
import { getIssues, approveIssue, rejectIssue, returnIssue } from '../../api/issues.api';
import { getItems } from '../../api/items.api';
import { getApiErrorMessage } from '../../utils/errors';
import { ISSUE_STATUS_OPTIONS } from '../../constants/issue.constants';
import type { InventoryIssue, InventoryIssuePagination, InventoryIssueStatus, InventoryReturnFormData, InventoryRejectFormData } from '../../types/issue.types';
import type { InventoryItem } from '../../types/item.types';

export default function IssuesPage() {
  const [issues, setIssues] = useState<InventoryIssue[]>([]);
  const [pagination, setPagination] = useState<InventoryIssuePagination | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemId, setItemId] = useState<number | ''>('');
  const [status, setStatus] = useState<InventoryIssueStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<InventoryIssue | null>(null);
  const [returnTarget, setReturnTarget] = useState<InventoryIssue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getItems({ limit: 100 }).then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [itemId, status]);

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, status, page]);

  async function loadIssues() {
    try {
      setLoading(true);
      const result = await getIssues({ item_id: itemId || undefined, status: status || undefined, page, limit: 25 });
      setIssues(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load issues'));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(issue: InventoryIssue) {
    setActionError(null);
    try {
      await approveIssue(issue.issue_id);
      await loadIssues();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setActionError(getApiErrorMessage(err, 'Failed to approve issue'));
    }
  }

  async function handleReject(data: InventoryRejectFormData) {
    if (!rejectTarget) return;
    setSubmitting(true);
    try {
      await rejectIssue(rejectTarget.issue_id, data);
      setRejectTarget(null);
      await loadIssues();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn(data: InventoryReturnFormData) {
    if (!returnTarget) return;
    setSubmitting(true);
    try {
      await returnIssue(returnTarget.issue_id, data);
      setReturnTarget(null);
      await loadIssues();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issues & Returns</h1>
          <p className="text-slate-600 mt-1">Issue stock/assets to holders and process approvals and returns</p>
        </div>
        <Link to="/inventory/issues/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Issue Item
          </Button>
        </Link>
      </div>

      <IssuesTabs />

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{actionError}</div>
      )}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <Select
            value={itemId}
            onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : '')}
            placeholder="All Items"
            options={items.map((i) => ({ value: String(i.item_id), label: i.name }))}
            className="w-full sm:w-48"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as InventoryIssueStatus | '')}
            placeholder="All Statuses"
            options={ISSUE_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            className="w-full sm:w-48"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <IssueTable
              issues={issues}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              onReturn={setReturnTarget}
            />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} issues)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <RejectIssueModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleReject}
        isLoading={submitting}
      />
      <ReturnIssueModal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        issue={returnTarget}
        onSubmit={handleReturn}
        isLoading={submitting}
      />
    </div>
  );
}
