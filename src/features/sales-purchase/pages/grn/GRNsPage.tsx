import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, PackageCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteGRN, getGRNs } from '../../api/sales-purchase.api';
import type { GRN } from '../../types/sales-purchase.types';
import { docStatusInfo } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'grns'];

export default function GRNsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<GRN | null>(null);
  const { data: grns = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getGRNs });

  const remove = useMutation({
    mutationFn: (g: GRN) => deleteGRN(g.grn_id),
    onSuccess: (_, g) => {
      queryClient.setQueryData<GRN[]>(KEY, (current) => current?.filter((x) => x.grn_id !== g.grn_id));
      toast.success(`${g.grn_number} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this goods receipt')),
    onSettled: () => setPendingDelete(null),
  });

  const count = (s: string) => grns.filter((g) => g.status === s).length;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grns
      .filter((g) => status === 'all' || g.status === status)
      .filter((g) => !q || [g.grn_number, g.purchase_order?.po_number, g.vendor?.vendor_name].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => b.grn_id - a.grn_id);
  }, [grns, search, status]);

  const newButton = (
    <Link to="/sales-purchase/grn/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> Record goods received
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load goods receipts')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={PackageCheck} title="Goods received (GRN)" description="A record of goods that arrived against a purchase order — what came in, and what was rejected." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : grns.length === 0 ? (
        <EmptyState icon={PackageCheck} title="No goods received yet" message="When a delivery arrives for an approved purchase order, record it here. Posting it updates the order and lets you raise the vendor's invoice." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by GRN, order number or vendor"
            />
            <Segmented
              label="Filter by status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: grns.length },
                { value: 'DRAFT', label: 'Draft', count: count('DRAFT') },
                { value: 'POSTED', label: 'Posted', count: count('POSTED') },
                { value: 'CANCELLED', label: 'Cancelled', count: count('CANCELLED') },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setStatus('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(g) => g.grn_id}
              page={page}
              onPage={setPage}
              noun="receipts"
              minWidth={760}
              columns={[
                {
                  header: 'GRN no.',
                  cell: (g) => (
                    <Link to={`/sales-purchase/grn/${g.grn_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {g.grn_number}
                    </Link>
                  ),
                },
                {
                  header: 'Purchase order',
                  cell: (g) =>
                    g.purchase_order ? (
                      <Link to={`/sales-purchase/purchase-orders/${g.purchase_order.po_id}`} className="text-slate-700 hover:text-brand">
                        {g.purchase_order.po_number}
                      </Link>
                    ) : (
                      '—'
                    ),
                },
                { header: 'Vendor', cell: (g) => <span className="block max-w-[200px] truncate text-slate-700">{g.vendor?.vendor_name ?? '—'}</span> },
                { header: 'Received on', cell: (g) => <span className="whitespace-nowrap text-slate-600">{shortDate(g.received_date)}</span> },
                {
                  header: 'Status',
                  cell: (g) => {
                    const s = docStatusInfo(g.status);
                    return <StatusPill label={s.label} color={s.color} title={s.hint} />;
                  },
                },
              ]}
              actions={(g) => {
                const draft = g.status === 'DRAFT';
                return (
                  <>
                    <IconAction icon={Eye} label="View receipt" to={`/sales-purchase/grn/${g.grn_id}`} tone="brand" />
                    <IconAction icon={Pencil} label={draft ? 'Edit receipt' : 'Only draft receipts can be edited'} to={draft ? `/sales-purchase/grn/${g.grn_id}/edit` : undefined} disabled={!draft} />
                    <IconAction icon={Trash2} label={draft ? 'Delete receipt' : 'Only draft receipts can be deleted — cancel it instead'} tone="danger" onClick={() => setPendingDelete(g)} disabled={!draft} />
                  </>
                );
              }}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this goods receipt?"
        message={pendingDelete ? `Draft ${pendingDelete.grn_number} will be removed. This can't be undone.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete receipt'}
      />
    </div>
  );
}
