import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { toNumber } from '../../../../utils/dashboardFormat';
import RegisterView from '../../components/reports/RegisterView';
import { getFullPurchaseRegister } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function PurchaseRegisterPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'purchase-register'], queryFn: getFullPurchaseRegister });

  const rows = (data?.data ?? []).map((r, i) => ({
    key: `${r.invoiceNumber}-${r.item.item_id}-${i}`,
    invoiceNumber: r.invoiceNumber,
    theirNumber: r.vendorInvoiceNumber,
    date: r.invoiceDate,
    party: r.vendor.vendor_name,
    partyCode: r.vendor.vendor_code,
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
      title="Purchase register"
      description="Every line of every posted vendor invoice — ready for accounts and GST returns."
      partyLabel="Vendor"
      rows={rows}
      summary={data?.summary}
      isLoading={isLoading}
      error={error}
      errorMessage={error ? getApiErrorMessage(error, 'Failed to load purchase register') : ''}
      onRetry={() => refetch()}
      fileName="purchase-register"
    />
  );
}
