import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock, Handshake, Pencil, Truck } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { btnSecondary, longDate } from '../../../../components/premium/styles';
import { getCustomers, getPaymentTerm, getVendors } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { payWithin } from '../../utils/paymentTerm';

function PartyList({ rows, empty }: { rows: { id: number; name: string; code: string; to: string }[]; empty: string }) {
  if (rows.length === 0) return <p className="py-2 text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
          <Link to={r.to} className="truncate font-medium text-slate-900 hover:text-brand">
            {r.name}
          </Link>
          <span className="font-mono text-xs text-slate-400">{r.code}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PaymentTermDetailsPage() {
  const { id = '' } = useParams();
  const { data: term, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'payment-term', id], queryFn: () => getPaymentTerm(id), enabled: Boolean(id) });
  const { data: vendors = [] } = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });
  const { data: customers = [] } = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });

  const back = (
    <Link to="/sales-purchase/payment-terms" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Payment terms
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !term) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load payment term')} onRetry={() => refetch()} />
      </div>
    );
  }

  const onVendors = vendors
    .filter((v) => v.payment_term_id === term.payment_term_id)
    .map((v) => ({ id: v.vendor_id, name: v.vendor_name, code: v.vendor_code, to: `/sales-purchase/vendors/${v.vendor_id}` }));
  const onCustomers = customers
    .filter((c) => c.payment_term_id === term.payment_term_id)
    .map((c) => ({ id: c.customer_id, name: c.customer_name, code: c.customer_code, to: `/sales-purchase/customers/${c.customer_id}` }));

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={CalendarClock}
        title={term.term_name}
        meta={`${payWithin(term.days)} of the invoice · added ${longDate(term.created_at)}`}
        actions={
          <Link to={`/sales-purchase/payment-terms/${term.payment_term_id}/edit`} className={btnSecondary}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard title={`Vendors on this term · ${onVendors.length}`} icon={Truck}>
          <PartyList rows={onVendors} empty="No vendors use this term." />
        </InfoCard>
        <InfoCard title={`Customers on this term · ${onCustomers.length}`} icon={Handshake} delay={60}>
          <PartyList rows={onCustomers} empty="No customers use this term." />
        </InfoCard>
      </div>
    </div>
  );
}
