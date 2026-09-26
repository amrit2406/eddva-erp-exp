import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deletePaymentTerm, getCustomers, getPaymentTerms, getVendors } from '../../api/sales-purchase.api';
import type { PaymentTerm } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { payWithin } from '../../utils/paymentTerm';

const KEY = ['sales-purchase', 'payment-terms'];

export default function PaymentTermsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PaymentTerm | null>(null);

  const { data: terms = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getPaymentTerms });
  const { data: vendors = [] } = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });
  const { data: customers = [] } = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });
  const usage = useMemo(() => {
    const map = new Map<number, { vendors: number; customers: number }>();
    const bump = (id: number | null, key: 'vendors' | 'customers') => {
      if (!id) return;
      const u = map.get(id) ?? { vendors: 0, customers: 0 };
      u[key] += 1;
      map.set(id, u);
    };
    vendors.forEach((v) => bump(v.payment_term_id, 'vendors'));
    customers.forEach((c) => bump(c.payment_term_id, 'customers'));
    return map;
  }, [vendors, customers]);

  const remove = useMutation({
    mutationFn: (t: PaymentTerm) => deletePaymentTerm(t.payment_term_id),
    onSuccess: (_, t) => {
      queryClient.setQueryData<PaymentTerm[]>(KEY, (current) => current?.filter((x) => x.payment_term_id !== t.payment_term_id));
      toast.success(`“${t.term_name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this payment term')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return terms.filter((t) => !q || t.term_name.toLowerCase().includes(q)).sort((a, b) => a.days - b.days || a.term_name.localeCompare(b.term_name));
  }, [terms, search]);

  const usedBy = (t: PaymentTerm) => {
    const u = usage.get(t.payment_term_id);
    const parts = [u?.vendors ? `${u.vendors} vendor${u.vendors === 1 ? '' : 's'}` : '', u?.customers ? `${u.customers} customer${u.customers === 1 ? '' : 's'}` : ''].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Not used';
  };

  const newButton = (
    <Link to="/sales-purchase/payment-terms/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New payment term
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load payment terms')} onRetry={() => refetch()} />;
  const deleteUse = pendingDelete ? usage.get(pendingDelete.payment_term_id) : undefined;
  const deleteCount = (deleteUse?.vendors ?? 0) + (deleteUse?.customers ?? 0);

  return (
    <div className="space-y-5">
      <ListHeader icon={CalendarClock} title="Payment terms" description="How many days vendors and customers get to pay an invoice." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : terms.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No payment terms yet" message="Add terms like “Cash on delivery”, “Net 15” or “Net 30”, then pick one for each vendor and customer." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search payment terms"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} term{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(t) => t.payment_term_id}
              page={page}
              onPage={setPage}
              noun="terms"
              minWidth={560}
              columns={[
                {
                  header: 'Term',
                  cell: (t) => (
                    <Link to={`/sales-purchase/payment-terms/${t.payment_term_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {t.term_name}
                    </Link>
                  ),
                },
                { header: 'Pay', cell: (t) => <span className="text-slate-700">{payWithin(t.days)}</span> },
                { header: 'Used by', cell: (t) => <span className="text-slate-600">{usedBy(t)}</span> },
              ]}
              actions={(t) => (
                <>
                  <IconAction icon={Eye} label="View term" to={`/sales-purchase/payment-terms/${t.payment_term_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit term" to={`/sales-purchase/payment-terms/${t.payment_term_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete term" tone="danger" onClick={() => setPendingDelete(t)} />
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
        title="Delete this payment term?"
        message={
          pendingDelete
            ? deleteCount > 0
              ? `“${pendingDelete.term_name}” is set on ${usedBy(pendingDelete)}. Move them to another term first, or the delete may be refused.`
              : `“${pendingDelete.term_name}” isn't used and will be removed. This can't be undone.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete term'}
      />
    </div>
  );
}
