import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Stamp, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteApprovalRule, getApprovalRules } from '../../api/sales-purchase.api';
import type { ApprovalRule } from '../../types/sales-purchase.types';
import { amountRange } from '../../utils/approvalRule';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'approval-rules'];

export default function ApprovalRulesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ApprovalRule | null>(null);
  const { data: rules = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getApprovalRules });

  const remove = useMutation({
    mutationFn: (r: ApprovalRule) => deleteApprovalRule(r.rule_id),
    onSuccess: (_, r) => {
      queryClient.setQueryData<ApprovalRule[]>(KEY, (current) => current?.filter((x) => x.rule_id !== r.rule_id));
      toast.success(`Rule “${r.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this rule')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rules.filter((r) => !q || [r.name, r.approver_role?.name].some((v) => v?.toLowerCase().includes(q))).sort((a, b) => a.sequence - b.sequence);
  }, [rules, search]);

  const newButton = (
    <Link to="/sales-purchase/approval-rules/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New rule
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load approval rules')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Stamp} title="Approval rules" description="Who has to approve a purchase order, depending on how much it's for." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : rules.length === 0 ? (
        <EmptyState
          icon={Stamp}
          title="No approval rules yet"
          message="Set who approves orders by amount — for example, anything above ₹50,000 needs the Finance Head."
          action={newButton}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by rule or approver"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} rule{filtered.length === 1 ? '' : 's'} · lower steps approve first
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(r) => r.rule_id}
              page={page}
              onPage={setPage}
              noun="rules"
              minWidth={680}
              columns={[
                { header: 'Step', cell: (r) => <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy text-xs font-semibold text-white">{r.sequence}</span> },
                {
                  header: 'Rule',
                  cell: (r) => (
                    <Link to={`/sales-purchase/approval-rules/${r.rule_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {r.name}
                    </Link>
                  ),
                },
                { header: 'Order amount', cell: (r) => <span className="text-slate-700">{amountRange(r.min_amount, r.max_amount)}</span> },
                { header: 'Approved by', cell: (r) => <span className="text-slate-700">{r.approver_role?.name ?? '—'}</span> },
                { header: 'Status', cell: (r) => <StatusPill label={r.is_active ? 'On' : 'Off'} color={r.is_active ? '#15936a' : '#94a3b8'} /> },
              ]}
              actions={(r) => (
                <>
                  <IconAction icon={Eye} label="View rule" to={`/sales-purchase/approval-rules/${r.rule_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit rule" to={`/sales-purchase/approval-rules/${r.rule_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete rule" tone="danger" onClick={() => setPendingDelete(r)} />
                </>
              )}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this rule?"
        message={pendingDelete ? `Orders ${amountRange(pendingDelete.min_amount, pendingDelete.max_amount).toLowerCase()} will no longer need ${pendingDelete.approver_role?.name ?? 'this'} approval. Turning the rule off keeps it for later.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete rule'}
      />
    </div>
  );
}
