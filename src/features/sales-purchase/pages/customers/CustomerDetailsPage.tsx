import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, ClipboardList, Handshake, MapPin, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import ContactsCard from '../../components/parties/ContactsCard';
import PartyMoneyCard from '../../components/parties/PartyMoneyCard';
import {
  addCustomerContact,
  deleteCustomer,
  deleteCustomerContact,
  getCustomer,
  getSalesInvoices,
  getSalesOrders,
  updateCustomerContact,
} from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatAddress } from '../../utils/party';
import { payWithin } from '../../utils/paymentTerm';
import { soStatusInfo } from '../../utils/soStatus';

const RECENT = 5;

export default function CustomerDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const key = ['sales-purchase', 'customer', id];

  const { data: customer, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getCustomer(id), enabled: Boolean(id) });
  const { data: invoices = [] } = useQuery({ queryKey: ['sales-purchase', 'sales-invoices'], queryFn: getSalesInvoices });
  const { data: orders = [] } = useQuery({ queryKey: ['sales-purchase', 'sales-orders'], queryFn: getSalesOrders });
  const reload = () => queryClient.invalidateQueries({ queryKey: key });

  const remove = useMutation({
    mutationFn: () => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'customers'] });
      toast.success(`“${customer?.customer_name}” deleted`);
      navigate('/sales-purchase/customers');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this customer')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Customers
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !customer) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load customer')} onRetry={() => refetch()} />
      </div>
    );
  }

  const theirInvoices = invoices
    .filter((i) => i.customer_id === customer.customer_id)
    .map((i) => ({ id: i.si_id, number: i.invoice_number, date: i.invoice_date, total: i.grand_total, paid: i.paid_amount, paymentStatus: i.payment_status, to: `/sales-purchase/sales-invoices/${i.si_id}` }));
  const theirOrders = orders.filter((o) => o.customer_id === customer.customer_id).sort((a, b) => b.so_id - a.so_id);
  const address = formatAddress(customer);
  const inactive = customer.status === 'INACTIVE';

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Handshake}
        title={customer.customer_name}
        status={<StatusPill label={inactive ? 'Inactive' : 'Active'} color={inactive ? '#94a3b8' : '#15936a'} />}
        meta={
          <>
            <span className="font-mono">{customer.customer_code}</span> · customer since {longDate(customer.created_at)}
          </>
        }
        actions={
          <>
            {!inactive && (
              <Link to="/sales-purchase/sales-orders/new" className={btnPrimary}>
                <ClipboardList className="h-4 w-4" /> New sales order
              </Link>
            )}
            <Link to={`/sales-purchase/customers/${customer.customer_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnQuietDanger}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <PartyMoneyCard kind="customer" invoices={theirInvoices} allTo="/sales-purchase/sales-invoices" />
          <InfoCard title={`Sales orders · ${theirOrders.length}`} icon={ClipboardList} delay={60}>
            {theirOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No sales orders for this customer yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {theirOrders.slice(0, RECENT).map((so) => {
                  const s = soStatusInfo(so.status);
                  return (
                    <li key={so.so_id} className="flex items-center gap-3 py-2 text-sm">
                      <Link to={`/sales-purchase/sales-orders/${so.so_id}`} className="font-medium text-brand-navy hover:text-brand">
                        {so.so_number}
                      </Link>
                      <span className="text-xs text-slate-400">{shortDate(so.so_date)}</span>
                      <span className="ml-auto font-medium tabular-nums text-slate-900">{rupees(toNumber(so.grand_total))}</span>
                      <StatusPill label={s.label} color={s.color} />
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoCard>
          <ContactsCard
            contacts={customer.contacts ?? []}
            onAdd={(values) => addCustomerContact(id, values)}
            onUpdate={(contactId, values) => updateCustomerContact(id, contactId, values)}
            onDelete={(contactId) => deleteCustomerContact(id, contactId)}
            onChanged={reload}
          />
        </div>

        <div className="space-y-5">
          <InfoCard
            title="Business"
            icon={Building2}
            rows={[
              ['GSTIN', customer.gstin ? <span key="g" className="font-mono">{customer.gstin}</span> : '—'],
              ['PAN / Tax ID', customer.tax_id ? <span key="t" className="font-mono">{customer.tax_id}</span> : '—'],
              ['Payment term', customer.payment_term ? `${customer.payment_term.term_name} · ${payWithin(customer.payment_term.days).toLowerCase()}` : 'No fixed term'],
              ['Credit limit', customer.credit_limit ? rupees(toNumber(customer.credit_limit)) : 'Not set'],
            ]}
          />
          <InfoCard title="Address" icon={MapPin} delay={60}>
            <p className="whitespace-pre-line text-sm text-slate-700">{address || 'No address added yet.'}</p>
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this customer?"
        message={`“${customer.customer_name}” will be removed. If they have orders or invoices the delete may be refused — marking them inactive keeps their history.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete customer'}
      />
    </div>
  );
}
