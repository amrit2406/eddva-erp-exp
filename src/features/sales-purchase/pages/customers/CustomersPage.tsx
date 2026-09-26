import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Handshake, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteCustomer, getCustomers, getPaymentTerms, getSalesInvoices } from '../../api/sales-purchase.api';
import type { Customer } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'customers'];

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  const { data: customers = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getCustomers });
  const { data: terms = [] } = useQuery({ queryKey: ['sales-purchase', 'payment-terms'], queryFn: getPaymentTerms });
  const { data: invoices = [] } = useQuery({ queryKey: ['sales-purchase', 'sales-invoices'], queryFn: getSalesInvoices });
  const termName = useMemo(() => new Map(terms.map((t) => [t.payment_term_id, t.term_name])), [terms]);
  const owed = useMemo(() => {
    const map = new Map<number, number>();
    invoices.forEach((i) => map.set(i.customer_id, (map.get(i.customer_id) ?? 0) + Math.max(0, toNumber(i.grand_total) - toNumber(i.paid_amount))));
    return map;
  }, [invoices]);

  const remove = useMutation({
    mutationFn: (v: Customer) => deleteCustomer(v.customer_id),
    onSuccess: (_, v) => {
      queryClient.setQueryData<Customer[]>(KEY, (current) => current?.filter((x) => x.customer_id !== v.customer_id));
      toast.success(`“${v.customer_name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this customer')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers
      .filter((v) => (status === 'all' ? true : status === 'INACTIVE' ? v.status === 'INACTIVE' : v.status !== 'INACTIVE'))
      .filter((v) => !q || [v.customer_name, v.customer_code, v.gstin, v.city].some((x) => x?.toLowerCase().includes(q)))
      .sort((a, b) => a.customer_name.localeCompare(b.customer_name));
  }, [customers, search, status]);

  const newButton = (
    <Link to="/sales-purchase/customers/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New customer
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load customers')} onRetry={() => refetch()} />;
  const pendingOwed = pendingDelete ? (owed.get(pendingDelete.customer_id) ?? 0) : 0;

  return (
    <div className="space-y-5">
      <ListHeader icon={Handshake} title="Customers" description="People and organisations you sell to, with their contacts and what they owe you." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : customers.length === 0 ? (
        <EmptyState icon={Handshake} title="No customers yet" message="Add the customers you sell to. Sales orders and invoices are raised against a customer." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, code, GSTIN or city"
            />
            <Segmented
              label="Filter by status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: customers.length },
                { value: 'ACTIVE', label: 'Active', count: customers.filter((v) => v.status !== 'INACTIVE').length },
                { value: 'INACTIVE', label: 'Inactive', count: customers.filter((v) => v.status === 'INACTIVE').length },
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
              rowKey={(v) => v.customer_id}
              page={page}
              onPage={setPage}
              noun="customers"
              minWidth={820}
              columns={[
                {
                  header: 'Customer',
                  cell: (v) => (
                    <>
                      <Link to={`/sales-purchase/customers/${v.customer_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {v.customer_name}
                      </Link>
                      <p className="font-mono text-[11px] text-slate-400">{v.customer_code}</p>
                    </>
                  ),
                },
                { header: 'City', cell: (v) => <span className="text-slate-600">{[v.city, v.state].filter(Boolean).join(', ') || '—'}</span> },
                { header: 'GSTIN', cell: (v) => <span className="font-mono text-xs text-slate-600">{v.gstin || '—'}</span> },
                { header: 'Payment term', cell: (v) => <span className="text-slate-600">{v.payment_term_id ? (termName.get(v.payment_term_id) ?? '—') : '—'}</span> },
                {
                  header: 'They owe',
                  align: 'right',
                  cell: (v) => {
                    const amount = owed.get(v.customer_id) ?? 0;
                    return <span className={amount > 0 ? 'font-semibold text-red-600' : 'text-slate-400'}>{amount > 0 ? rupees(amount) : '—'}</span>;
                  },
                },
                { header: 'Status', cell: (v) => <StatusPill label={v.status === 'INACTIVE' ? 'Inactive' : 'Active'} color={v.status === 'INACTIVE' ? '#94a3b8' : '#15936a'} /> },
              ]}
              actions={(v) => (
                <>
                  <IconAction icon={Eye} label="View customer" to={`/sales-purchase/customers/${v.customer_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit customer" to={`/sales-purchase/customers/${v.customer_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete customer" tone="danger" onClick={() => setPendingDelete(v)} />
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
        title="Delete this customer?"
        message={
          pendingDelete
            ? pendingOwed > 0
              ? `“${pendingDelete.customer_name}” still owes you ${rupees(pendingOwed)}. Marking them inactive (Edit → Inactive) keeps their history — deleting may be refused.`
              : `“${pendingDelete.customer_name}” will be removed. If they have orders or invoices, the delete may be refused — mark them inactive instead.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete customer'}
      />
    </div>
  );
}
