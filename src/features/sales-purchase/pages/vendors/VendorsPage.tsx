import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2, Truck } from 'lucide-react';
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
import { deleteVendor, getInvoices, getPaymentTerms, getVendors } from '../../api/sales-purchase.api';
import type { Vendor } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'vendors'];

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Vendor | null>(null);

  const { data: vendors = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getVendors });
  const { data: terms = [] } = useQuery({ queryKey: ['sales-purchase', 'payment-terms'], queryFn: getPaymentTerms });
  const { data: invoices = [] } = useQuery({ queryKey: ['sales-purchase', 'purchase-invoices'], queryFn: getInvoices });
  const termName = useMemo(() => new Map(terms.map((t) => [t.payment_term_id, t.term_name])), [terms]);
  const owed = useMemo(() => {
    const map = new Map<number, number>();
    invoices.forEach((i) => map.set(i.vendor_id, (map.get(i.vendor_id) ?? 0) + Math.max(0, toNumber(i.grand_total) - toNumber(i.paid_amount))));
    return map;
  }, [invoices]);

  const remove = useMutation({
    mutationFn: (v: Vendor) => deleteVendor(v.vendor_id),
    onSuccess: (_, v) => {
      queryClient.setQueryData<Vendor[]>(KEY, (current) => current?.filter((x) => x.vendor_id !== v.vendor_id));
      toast.success(`“${v.vendor_name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this vendor')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors
      .filter((v) => (status === 'all' ? true : status === 'INACTIVE' ? v.status === 'INACTIVE' : v.status !== 'INACTIVE'))
      .filter((v) => !q || [v.vendor_name, v.vendor_code, v.gstin, v.city].some((x) => x?.toLowerCase().includes(q)))
      .sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));
  }, [vendors, search, status]);

  const newButton = (
    <Link to="/sales-purchase/vendors/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New vendor
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load vendors')} onRetry={() => refetch()} />;
  const pendingOwed = pendingDelete ? (owed.get(pendingDelete.vendor_id) ?? 0) : 0;

  return (
    <div className="space-y-5">
      <ListHeader icon={Truck} title="Vendors" description="Suppliers you buy from, with their contacts, bank details and what you owe them." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : vendors.length === 0 ? (
        <EmptyState icon={Truck} title="No vendors yet" message="Add the suppliers you buy from. Purchase orders and invoices are raised against a vendor." action={newButton} />
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
                { value: 'all', label: 'All', count: vendors.length },
                { value: 'ACTIVE', label: 'Active', count: vendors.filter((v) => v.status !== 'INACTIVE').length },
                { value: 'INACTIVE', label: 'Inactive', count: vendors.filter((v) => v.status === 'INACTIVE').length },
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
              rowKey={(v) => v.vendor_id}
              page={page}
              onPage={setPage}
              noun="vendors"
              minWidth={820}
              columns={[
                {
                  header: 'Vendor',
                  cell: (v) => (
                    <>
                      <Link to={`/sales-purchase/vendors/${v.vendor_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {v.vendor_name}
                      </Link>
                      <p className="font-mono text-[11px] text-slate-400">{v.vendor_code}</p>
                    </>
                  ),
                },
                { header: 'City', cell: (v) => <span className="text-slate-600">{[v.city, v.state].filter(Boolean).join(', ') || '—'}</span> },
                { header: 'GSTIN', cell: (v) => <span className="font-mono text-xs text-slate-600">{v.gstin || '—'}</span> },
                { header: 'Payment term', cell: (v) => <span className="text-slate-600">{v.payment_term_id ? (termName.get(v.payment_term_id) ?? '—') : '—'}</span> },
                {
                  header: 'You owe',
                  align: 'right',
                  cell: (v) => {
                    const amount = owed.get(v.vendor_id) ?? 0;
                    return <span className={amount > 0 ? 'font-semibold text-red-600' : 'text-slate-400'}>{amount > 0 ? rupees(amount) : '—'}</span>;
                  },
                },
                { header: 'Status', cell: (v) => <StatusPill label={v.status === 'INACTIVE' ? 'Inactive' : 'Active'} color={v.status === 'INACTIVE' ? '#94a3b8' : '#15936a'} /> },
              ]}
              actions={(v) => (
                <>
                  <IconAction icon={Eye} label="View vendor" to={`/sales-purchase/vendors/${v.vendor_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit vendor" to={`/sales-purchase/vendors/${v.vendor_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete vendor" tone="danger" onClick={() => setPendingDelete(v)} />
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
        title="Delete this vendor?"
        message={
          pendingDelete
            ? pendingOwed > 0
              ? `You still owe “${pendingDelete.vendor_name}” ${rupees(pendingOwed)}. Marking them inactive (Edit → Inactive) keeps their history — deleting may be refused.`
              : `“${pendingDelete.vendor_name}” will be removed. If they have orders or invoices, the delete may be refused — mark them inactive instead.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete vendor'}
      />
    </div>
  );
}
