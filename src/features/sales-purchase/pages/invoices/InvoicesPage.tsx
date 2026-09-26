import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteInvoice, getInvoices } from '../../api/sales-purchase.api';
import type { Invoice } from '../../types/sales-purchase.types';
import { docStatusInfo } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';
import { paymentStatusInfo } from '../../utils/party';

const KEY = ['sales-purchase', 'purchase-invoices'];
const balance = (i: Invoice) => Math.max(0, toNumber(i.grand_total) - toNumber(i.paid_amount));
const isOverdue = (i: Invoice) => i.status === 'POSTED' && balance(i) > 0 && !!i.due_date && new Date(i.due_date) < new Date(new Date().toDateString());

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const { data: invoices = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getInvoices });

  const remove = useMutation({
    mutationFn: (i: Invoice) => deleteInvoice(i.pi_id),
    onSuccess: (_, i) => {
      queryClient.setQueryData<Invoice[]>(KEY, (current) => current?.filter((x) => x.pi_id !== i.pi_id));
      toast.success(`${i.invoice_number} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this invoice')),
    onSettled: () => setPendingDelete(null),
  });

  const views: Record<string, (i: Invoice) => boolean> = {
    all: () => true,
    draft: (i) => i.status === 'DRAFT',
    unpaid: (i) => i.status === 'POSTED' && balance(i) > 0,
    overdue: isOverdue,
    paid: (i) => i.status === 'POSTED' && balance(i) === 0,
  };
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const inView = views[view] ?? views.all;
    return invoices.filter(inView).filter((i) => !q || [i.invoice_number, i.vendor_invoice_number, i.vendor?.vendor_name].some((v) => v?.toLowerCase().includes(q))).sort((a, b) => b.pi_id - a.pi_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, search, view]);
  const toPay = invoices.filter(views.unpaid).reduce((s, i) => s + balance(i), 0);

  const newButton = (
    <Link to="/sales-purchase/invoices/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> Record vendor invoice
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load purchase invoices')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={FileText} title="Purchase invoices" description="Bills from vendors — what you owe, and what's been paid." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No vendor invoices yet" message="When a vendor sends a bill, record it here. Once posted, you can record payments against it." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by invoice no., vendor's no. or vendor"
            />
            <Segmented
              label="Filter invoices"
              value={view}
              onChange={(v) => {
                setView(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: invoices.length },
                { value: 'draft', label: 'Draft', count: invoices.filter(views.draft).length },
                { value: 'unpaid', label: 'To pay', count: invoices.filter(views.unpaid).length },
                { value: 'overdue', label: 'Overdue', count: invoices.filter(views.overdue).length },
                { value: 'paid', label: 'Paid', count: invoices.filter(views.paid).length },
              ]}
            />
          </div>
          {toPay > 0 && (
            <p className="text-sm text-slate-600">
              You owe vendors <span className="font-semibold text-red-600">{rupees(toPay)}</span> across {invoices.filter(views.unpaid).length} posted invoice(s).
            </p>
          )}
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setView('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(i) => i.pi_id}
              page={page}
              onPage={setPage}
              noun="invoices"
              minWidth={860}
              columns={[
                {
                  header: 'Invoice',
                  cell: (i) => (
                    <>
                      <Link to={`/sales-purchase/invoices/${i.pi_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {i.invoice_number}
                      </Link>
                      <p className="text-[11px] text-slate-400">Their no. {i.vendor_invoice_number}</p>
                    </>
                  ),
                },
                { header: 'Vendor', cell: (i) => <span className="block max-w-[180px] truncate text-slate-700">{i.vendor?.vendor_name ?? '—'}</span> },
                {
                  header: 'Dates',
                  cell: (i) => (
                    <>
                      <p className="whitespace-nowrap text-slate-600">{shortDate(i.invoice_date)}</p>
                      {i.due_date && (
                        <p className={`flex items-center gap-1 whitespace-nowrap text-[11px] ${isOverdue(i) ? 'font-medium text-red-600' : 'text-slate-400'}`}>
                          {isOverdue(i) && <AlertTriangle className="h-3 w-3" />} Pay by {shortDate(i.due_date)}
                        </p>
                      )}
                    </>
                  ),
                },
                { header: 'Total', align: 'right', cell: (i) => <span className="font-medium text-slate-900">{rupees(toNumber(i.grand_total))}</span> },
                { header: 'Still to pay', align: 'right', cell: (i) => (balance(i) > 0 ? <span className="font-semibold text-red-600">{rupees(balance(i))}</span> : <span className="text-slate-400">—</span>) },
                {
                  header: 'Status',
                  cell: (i) => {
                    const s = i.status === 'POSTED' ? paymentStatusInfo(i.payment_status) : docStatusInfo(i.status);
                    return <StatusPill label={s.label} color={s.color} />;
                  },
                },
              ]}
              actions={(i) => {
                const draft = i.status === 'DRAFT';
                return (
                  <>
                    <IconAction icon={Eye} label="View invoice" to={`/sales-purchase/invoices/${i.pi_id}`} tone="brand" />
                    <IconAction icon={Pencil} label={draft ? 'Edit invoice' : 'Only draft invoices can be edited'} to={draft ? `/sales-purchase/invoices/${i.pi_id}/edit` : undefined} disabled={!draft} />
                    <IconAction icon={Trash2} label={draft ? 'Delete invoice' : 'Only drafts can be deleted — cancel it instead'} tone="danger" onClick={() => setPendingDelete(i)} disabled={!draft} />
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
        title="Delete this invoice?"
        message={pendingDelete ? `Draft ${pendingDelete.invoice_number} from ${pendingDelete.vendor?.vendor_name ?? 'the vendor'} will be removed. This can't be undone.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete invoice'}
      />
    </div>
  );
}
