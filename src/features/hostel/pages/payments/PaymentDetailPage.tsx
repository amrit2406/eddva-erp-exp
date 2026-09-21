import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import ReceiptButton from '../../components/payments/ReceiptButton';
import { getPayment } from '../../api/hostel.api';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getPayment(id)
      .then((data) => {
        if (!cancelled) setPayment(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load payment'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const residentId = relatedId(payment, 'resident', 'resident_id');
  const invoiceId = relatedId(payment, 'invoice', 'invoice_id');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/payments" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to payments
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Payment #{id}</h1>
              <RecordStatusBadge status={recordStatus(payment)} />
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {residentId && (
                <Link to={`/hostel/residents/${residentId}`} className="text-[#008BE9] hover:underline">
                  View resident
                </Link>
              )}
              {invoiceId && (
                <Link to={`/hostel/invoices/${invoiceId}`} className="text-[#008BE9] hover:underline">
                  View invoice
                </Link>
              )}
            </div>
          </div>
          <ReceiptButton paymentId={id!} />
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={payment} emptyMessage="No details available" />
      </Card>
    </div>
  );
}
