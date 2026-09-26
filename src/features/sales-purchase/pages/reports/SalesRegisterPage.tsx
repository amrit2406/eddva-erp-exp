import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { toNumber } from '../../../../utils/dashboardFormat';
import RegisterView from '../../components/reports/RegisterView';
import { getFullSalesRegister } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function SalesRegisterPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'sales-register'], queryFn: getFullSalesRegister });

  const rows = (data?.data ?? []).map((r, i) => ({
    key: `${r.invoiceNumber}-${r.item.item_id}-${i}`,
    invoiceNumber: r.invoiceNumber,
    date: r.invoiceDate,
    party: r.customer.customer_name,
    partyCode: r.customer.customer_code,
    item: r.item.item_name,
    itemCode: r.item.item_code,
    quantity: toNumber(r.quantity),
    taxable: toNumber(r.taxableValue),
    cgst: toNumber(r.cgst),
    sgst: toNumber(r.sgst),
    igst: toNumber(r.igst),
    discount: toNumber(r.discount),
    total: toNumber(r.lineTotal),
    paymentStatus: r.paymentStatus,
  }));

  return (
    <RegisterView
      icon={BookOpen}
      title="Sales register"
      description="Every line of every posted sales invoice — ready for accounts and GST returns."
      partyLabel="Customer"
      rows={rows}
      summary={data?.summary}
      isLoading={isLoading}
      error={error}
      errorMessage={error ? getApiErrorMessage(error, 'Failed to load sales register') : ''}
      onRetry={() => refetch()}
      fileName="sales-register"
    />
  );
}
