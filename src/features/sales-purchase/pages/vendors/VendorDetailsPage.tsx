import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, MapPin, Pencil, ShoppingCart, Trash2, Truck } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import BankDetailsCard from '../../components/parties/BankDetailsCard';
import ContactsCard from '../../components/parties/ContactsCard';
import PartyMoneyCard from '../../components/parties/PartyMoneyCard';
import {
  addVendorBankDetail,
  addVendorContact,
  deleteVendor,
  deleteVendorBankDetail,
  deleteVendorContact,
  getInvoices,
  getPurchaseOrders,
  getVendor,
  updateVendorBankDetail,
  updateVendorContact,
} from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatAddress } from '../../utils/party';
import { payWithin } from '../../utils/paymentTerm';
import { poStatusInfo } from '../../utils/poStatus';

const RECENT = 5;

export default function VendorDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const key = ['sales-purchase', 'vendor', id];

  const { data: vendor, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getVendor(id), enabled: Boolean(id) });
  const { data: invoices = [] } = useQuery({ queryKey: ['sales-purchase', 'purchase-invoices'], queryFn: getInvoices });
  const { data: orders = [] } = useQuery({ queryKey: ['sales-purchase', 'purchase-orders'], queryFn: getPurchaseOrders });
  const reload = () => queryClient.invalidateQueries({ queryKey: key });

  const remove = useMutation({
    mutationFn: () => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'vendors'] });
      toast.success(`“${vendor?.vendor_name}” deleted`);
      navigate('/sales-purchase/vendors');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this vendor')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/vendors" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Vendors
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !vendor) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load vendor')} onRetry={() => refetch()} />
      </div>
    );
  }

  const theirInvoices = invoices
    .filter((i) => i.vendor_id === vendor.vendor_id)
    .map((i) => ({ id: i.pi_id, number: i.invoice_number, date: i.invoice_date, total: i.grand_total, paid: i.paid_amount, paymentStatus: i.payment_status, to: `/sales-purchase/invoices/${i.pi_id}` }));
  const theirOrders = orders.filter((o) => o.vendor_id === vendor.vendor_id).sort((a, b) => b.po_id - a.po_id);
  const address = formatAddress(vendor);
  const inactive = vendor.status === 'INACTIVE';

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Truck}
        title={vendor.vendor_name}
        status={<StatusPill label={inactive ? 'Inactive' : 'Active'} color={inactive ? '#94a3b8' : '#15936a'} />}
        meta={
          <>
            <span className="font-mono">{vendor.vendor_code}</span> · vendor since {longDate(vendor.created_at)}
          </>
        }
        actions={
          <>
            {!inactive && (
              <Link to="/sales-purchase/purchase-orders/new" className={btnPrimary}>
                <ShoppingCart className="h-4 w-4" /> New purchase order
              </Link>
            )}
            <Link to={`/sales-purchase/vendors/${vendor.vendor_id}/edit`} className={btnSecondary}>
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
          <PartyMoneyCard kind="vendor" invoices={theirInvoices} allTo="/sales-purchase/invoices" />
          <InfoCard title={`Purchase orders · ${theirOrders.length}`} icon={ShoppingCart} delay={60}>
            {theirOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No purchase orders with this vendor yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {theirOrders.slice(0, RECENT).map((po) => {
                  const s = poStatusInfo(po.status);
                  return (
                    <li key={po.po_id} className="flex items-center gap-3 py-2 text-sm">
                      <Link to={`/sales-purchase/purchase-orders/${po.po_id}`} className="font-medium text-brand-navy hover:text-brand">
                        {po.po_number}
                      </Link>
                      <span className="text-xs text-slate-400">{shortDate(po.po_date)}</span>
                      <span className="ml-auto font-medium tabular-nums text-slate-900">{rupees(toNumber(po.grand_total))}</span>
                      <StatusPill label={s.label} color={s.color} />
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoCard>
          <ContactsCard
            contacts={vendor.contacts ?? []}
            onAdd={(values) => addVendorContact(id, values)}
            onUpdate={(contactId, values) => updateVendorContact(id, contactId, values)}
            onDelete={(contactId) => deleteVendorContact(id, contactId)}
            onChanged={reload}
          />
        </div>

        <div className="space-y-5">
          <InfoCard
            title="Business"
            icon={Building2}
            rows={[
              ['GSTIN', vendor.gstin ? <span key="g" className="font-mono">{vendor.gstin}</span> : '—'],
              ['PAN / Tax ID', vendor.tax_id ? <span key="t" className="font-mono">{vendor.tax_id}</span> : '—'],
              ['Payment term', vendor.payment_term ? `${vendor.payment_term.term_name} · ${payWithin(vendor.payment_term.days).toLowerCase()}` : 'No fixed term'],
              ['Credit limit', vendor.credit_limit ? rupees(toNumber(vendor.credit_limit)) : 'Not set'],
            ]}
          />
          <InfoCard title="Address" icon={MapPin} delay={60}>
            <p className="whitespace-pre-line text-sm text-slate-700">{address || 'No address added yet.'}</p>
          </InfoCard>
          <BankDetailsCard
            banks={vendor.bank_details ?? []}
            onAdd={(values) => addVendorBankDetail(id, values)}
            onUpdate={(bankId, values) => updateVendorBankDetail(id, bankId, values)}
            onDelete={(bankId) => deleteVendorBankDetail(id, bankId)}
            onChanged={reload}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this vendor?"
        message={`“${vendor.vendor_name}” will be removed. If they have orders or invoices the delete may be refused — marking them inactive keeps their history.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete vendor'}
      />
    </div>
  );
}
