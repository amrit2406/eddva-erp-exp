import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Stamp, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnQuietDanger, btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteApprovalRule, getApprovalRule } from '../../api/sales-purchase.api';
import { amountRange } from '../../utils/approvalRule';
import { getApiErrorMessage } from '../../utils/errors';

export default function ApprovalRuleDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: rule, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'approval-rule', id], queryFn: () => getApprovalRule(id), enabled: Boolean(id) });

  const remove = useMutation({
    mutationFn: () => deleteApprovalRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'approval-rules'] });
      toast.success(`Rule “${rule?.name}” deleted`);
      navigate('/sales-purchase/approval-rules');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this rule')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/approval-rules" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Approval rules
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !rule) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load rule')} onRetry={() => refetch()} />
      </div>
    );
  }

  const range = amountRange(rule.min_amount, rule.max_amount);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Stamp}
        title={rule.name}
        status={<StatusPill label={rule.is_active ? 'On' : 'Off'} color={rule.is_active ? '#15936a' : '#94a3b8'} />}
        meta={`Step ${rule.sequence} · added ${longDate(rule.created_at)}`}
        actions={
          <>
            <Link to={`/sales-purchase/approval-rules/${rule.rule_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnQuietDanger}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        }
      >
        <NextStep tone={rule.is_active ? 'info' : 'bad'}>
          {rule.is_active
            ? `Purchase orders ${range.replace(/^Up to/, 'up to').replace(/^Any amount/, 'of any amount')} need approval from ${rule.approver_role?.name ?? 'the chosen role'} at step ${rule.sequence}.`
            : 'This rule is turned off, so it is ignored when orders are sent for approval.'}
        </NextStep>
      </DetailHeader>

      <div className="max-w-xl">
        <InfoCard
          title="Rule"
          icon={Stamp}
          rows={[
            ['Order amount', range],
            ['Approved by', rule.approver_role?.name ?? '—'],
            ['Step', String(rule.sequence)],
            ['Status', rule.is_active ? 'On' : 'Off'],
          ]}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this rule?"
        message={`Orders ${range.toLowerCase()} will no longer need this approval. Turning the rule off keeps it for later.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete rule'}
      />
    </div>
  );
}
