import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
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
import { deletePayment, getPayments, getVendors } from '../../api/sales-purchase.api';
import type { Payment } from '../../types/sales-purchase.types';
import { paymentModeLabel } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'purchase-payments'];

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);
  const { data: payments = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getPayments });
  const { data: vendors = [] } = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });
  const vendorName = useMemo(() => new Map(vendors.map((v) => [v.vendor_id, v.vendor_name])), [vendors]);
  const vendorOf = (p: Payment) => (p.invoice?.vendor_id ? vendorName.get(p.invoice.vendor_id) : undefined) ?? '—';

  const remove = useMutation({
    mutationFn: (p: Payment) => deletePayment(p.payment_id),
    onSuccess: (_, p) => {
      queryClient.setQueryData<Payment[]>(KEY, (current) => current?.filter((x) => x.payment_id !== p.payment_id));
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoices'] });
      toast.success(`Payment of ${rupees(toNumber(p.amount))} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this payment')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter((p) => !q || [p.invoice?.invoice_number, p.reference_no, vendorOf(p), paymentModeLabel(p.mode)].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => b.payment_date.localeCompare(a.payment_date) || b.payment_id - a.payment_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, search, vendorName]);
  const total = filtered.reduce((s, p) => s + toNumber(p.amount), 0);

  const newButton = (
    <Link to="/sales-purchase/payments/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> Record payment
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load payments')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Wallet} title="Payments to vendors" description="Money you've paid against vendor invoices." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : payments.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet" message="When you pay a vendor, record it against their posted invoice so you always know what's still owed." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by invoice, vendor, mode or reference"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} payment{filtered.length === 1 ? '' : 's'} · {rupees(total)}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(p) => p.payment_id}
              page={page}
              onPage={setPage}
              noun="payments"
              minWidth={760}
              columns={[
                {
                  header: 'Paid on',
                  cell: (p) => (
                    <Link to={`/sales-purchase/payments/${p.payment_id}`} className="whitespace-nowrap font-semibold text-brand-navy hover:text-brand hover:underline">
                      {shortDate(p.payment_date)}
                    </Link>
                  ),
                },
                { header: 'Vendor', cell: (p) => <span className="block max-w-[180px] truncate text-slate-700">{vendorOf(p)}</span> },
                {
                  header: 'Invoice',
                  cell: (p) => (
                    <Link to={`/sales-purchase/invoices/${p.pi_id}`} className="text-slate-700 hover:text-brand">
                      {p.invoice?.invoice_number ?? `#${p.pi_id}`}
                    </Link>
                  ),
                },
                { header: 'How', cell: (p) => <span className="text-slate-600">{paymentModeLabel(p.mode)}</span> },
                { header: 'Reference', cell: (p) => <span className="font-mono text-xs text-slate-500">{p.reference_no || '—'}</span> },
                { header: 'Amount', align: 'right', cell: (p) => <span className="font-semibold text-slate-900">{rupees(toNumber(p.amount))}</span> },
              ]}
              actions={(p) => (
                <>
                  <IconAction icon={Eye} label="View payment" to={`/sales-purchase/payments/${p.payment_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit payment" to={`/sales-purchase/payments/${p.payment_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete payment" tone="danger" onClick={() => setPendingDelete(p)} />
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
        title="Delete this payment?"
        message={pendingDelete ? `The ${rupees(toNumber(pendingDelete.amount))} payment against ${pendingDelete.invoice?.invoice_number ?? 'the invoice'} will be removed, and that amount will show as owed again.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete payment'}
      />
    </div>
  );
}
