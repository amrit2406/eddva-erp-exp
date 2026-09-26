import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, HandCoins, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteSalesReceipt, getSalesReceipts, getCustomers } from '../../api/sales-purchase.api';
import type { SalesReceipt } from '../../types/sales-purchase.types';
import { paymentModeLabel } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'sales-receipts'];

export default function SalesReceiptsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SalesReceipt | null>(null);
  const { data: receipts = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getSalesReceipts });
  const { data: customers = [] } = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });
  const customerName = useMemo(() => new Map(customers.map((v) => [v.customer_id, v.customer_name])), [customers]);
  const customerOf = (p: SalesReceipt) => (p.invoice?.customer_id ? customerName.get(p.invoice.customer_id) : undefined) ?? '—';

  const remove = useMutation({
    mutationFn: (p: SalesReceipt) => deleteSalesReceipt(p.receipt_id),
    onSuccess: (_, p) => {
      queryClient.setQueryData<SalesReceipt[]>(KEY, (current) => current?.filter((x) => x.receipt_id !== p.receipt_id));
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoices'] });
      toast.success(`Receipt of ${rupees(toNumber(p.amount))} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this receipt')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receipts
      .filter((p) => !q || [p.invoice?.invoice_number, p.reference_no, customerOf(p), paymentModeLabel(p.mode)].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => b.receipt_date.localeCompare(a.receipt_date) || b.receipt_id - a.receipt_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipts, search, customerName]);
  const total = filtered.reduce((s, p) => s + toNumber(p.amount), 0);

  const newButton = (
    <Link to="/sales-purchase/sales-receipts/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> Record money received
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load receipts')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={HandCoins} title="Money received" description="Payments customers have made against your sales invoices." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : receipts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Nothing received yet" message="When a customer pays, record it against their posted invoice so you always know what's still due." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by invoice, customer, mode or reference"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} receipt{filtered.length === 1 ? '' : 's'} · {rupees(total)}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(p) => p.receipt_id}
              page={page}
              onPage={setPage}
              noun="receipts"
              minWidth={760}
              columns={[
                {
                  header: 'Received on',
                  cell: (p) => (
                    <Link to={`/sales-purchase/sales-receipts/${p.receipt_id}`} className="whitespace-nowrap font-semibold text-brand-navy hover:text-brand hover:underline">
                      {shortDate(p.receipt_date)}
                    </Link>
                  ),
                },
                { header: 'Customer', cell: (p) => <span className="block max-w-[180px] truncate text-slate-700">{customerOf(p)}</span> },
                {
                  header: 'Invoice',
                  cell: (p) => (
                    <Link to={`/sales-purchase/sales-invoices/${p.si_id}`} className="text-slate-700 hover:text-brand">
                      {p.invoice?.invoice_number ?? `#${p.si_id}`}
                    </Link>
                  ),
                },
                { header: 'How', cell: (p) => <span className="text-slate-600">{paymentModeLabel(p.mode)}</span> },
                { header: 'Reference', cell: (p) => <span className="font-mono text-xs text-slate-500">{p.reference_no || '—'}</span> },
                { header: 'Amount', align: 'right', cell: (p) => <span className="font-semibold text-slate-900">{rupees(toNumber(p.amount))}</span> },
              ]}
              actions={(p) => (
                <>
                  <IconAction icon={Eye} label="View receipt" to={`/sales-purchase/sales-receipts/${p.receipt_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit receipt" to={`/sales-purchase/sales-receipts/${p.receipt_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete receipt" tone="danger" onClick={() => setPendingDelete(p)} />
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
        title="Delete this receipt?"
        message={pendingDelete ? `The ${rupees(toNumber(pendingDelete.amount))} received against ${pendingDelete.invoice?.invoice_number ?? 'the invoice'} will be removed, and that amount will show as due again.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete receipt'}
      />
    </div>
  );
}
