import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Wallet } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordPanel from '../../components/common/RecordPanel';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import RecordPaymentModal from '../../components/invoices/RecordPaymentModal';
import ActionModal, { type ActionValues } from '../../components/residents/ActionModal';
import { cancelInvoice, getInvoice, getInvoicePayments, recordInvoicePayment } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { INVOICES_RESOURCE, balanceOf, invoiceActions } from '../../utils/invoices';
import { recordId, recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord, InvoicePaymentFormData, ListParams } from '../../types/hostel.types';

type ModalKind = 'pay' | 'cancel';

const paymentHref = (row: GenericRecord) => {
  const id = recordId(row, 'payment_id');
  return id ? `/hostel/payments/${id}` : undefined;
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(INVOICES_RESOURCE);
  const [invoice, setInvoice] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind | null>(null);
  // Bumped after a payment so the payments list refetches.
  const [paymentsKey, setPaymentsKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getInvoice(id)
      .then((data) => {
        if (!cancelled) setInvoice(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load invoice'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadPayments = useCallback((params: ListParams) => getInvoicePayments(id!, params), [id]);

  const handlePay = async (data: InvoicePaymentFormData) => {
    if (!id) return;
    await recordInvoicePayment(id, data);
    toast.success('Payment recorded');
    setModal(null);
    setInvoice(await getInvoice(id));
    setPaymentsKey((key) => key + 1);
  };

  const handleCancel = async (values: ActionValues) => {
    if (!id) return;
    await cancelInvoice(id, values.reason);
    toast.success('Invoice cancelled');
    setModal(null);
    setInvoice(await getInvoice(id));
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!invoice || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = recordStatus(invoice);
  const allowed = invoiceActions(status);
  const residentId = relatedId(invoice, 'resident', 'resident_id');
  const invoiceNo = [invoice.invoice_no, invoice.invoice_number].find((v) => typeof v === 'string' && v) as string | undefined;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/invoices" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to invoices
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{invoiceNo ?? `Invoice #${id}`}</h1>
              <RecordStatusBadge status={status} />
            </div>
            {residentId && (
              <Link to={`/hostel/residents/${residentId}`} className="inline-block mt-2 text-sm text-[#008BE9] hover:underline">
                View resident
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {allowed.pay && (can('pay') || can('update')) && (
              <Button variant="primary" onClick={() => setModal('pay')}>
                <Wallet className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
            {allowed.cancel && (can('cancel') || can('update')) && (
              <Button variant="ghost" onClick={() => setModal('cancel')}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Cancel Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={invoice} emptyMessage="No details available" />
      </Card>

      <Card className="border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Payments</h2>
        </div>
        <RecordPanel
          key={paymentsKey}
          load={loadPayments}
          emptyMessage="No payments recorded against this invoice"
          rowHref={paymentHref}
        />
      </Card>

      {modal === 'pay' && (
        <RecordPaymentModal defaultAmount={balanceOf(invoice)} onClose={() => setModal(null)} onSubmit={handlePay} />
      )}
      {modal === 'cancel' && (
        <ActionModal
          isOpen
          title="Cancel Invoice"
          submitLabel="Cancel Invoice"
          description="Cancel an invoice that shouldn't have been raised."
          fields={[
            {
              name: 'reason',
              label: 'Reason',
              type: 'textarea',
              required: true,
              placeholder: 'e.g. Generated for the wrong period',
            },
          ]}
          onClose={() => setModal(null)}
          onSubmit={handleCancel}
        />
      )}
    </div>
  );
}
