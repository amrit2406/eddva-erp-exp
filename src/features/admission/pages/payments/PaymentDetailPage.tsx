import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { getAdmissionPayment } from '../../api/admission.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatCurrency, formatDate, formatDateTime, formatLabel } from '../../utils/format';
import { paymentApplicantName } from '../../utils/payments';
import type { AdmissionPayment } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<AdmissionPayment | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getAdmissionPayment(id)
      .then((data) => {
        if (!cancelled) setPayment(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load payment'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <Link to="/admission/payments" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        All payments
      </Link>

      {loadError ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{loadError}</div>
        </Card>
      ) : !payment ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{formatCurrency(payment.amount_paid)}</h1>
            <p className="text-slate-600 mt-1">Admission fee from {paymentApplicantName(payment)}</p>
          </div>

          <Card className="border-slate-200 max-w-2xl">
            <div className="p-6">
              <dl className="space-y-4">
                <Detail label="Application">
                  <Link to={`/admission/applications/${payment.application_id}`} className="text-[#008BE9] hover:underline">
                    {paymentApplicantName(payment)} · Application #{payment.application_id}
                  </Link>
                </Detail>
                {payment.application?.program?.name && <Detail label="Program">{payment.application.program.name}</Detail>}
                <Detail label="Amount Paid">{formatCurrency(payment.amount_paid)}</Detail>
                <Detail label="Payment Mode"><span className="capitalize">{formatLabel(payment.payment_mode)}</span></Detail>
                <Detail label="Payment Date">{formatDate(payment.payment_date)}</Detail>
                <Detail label="Transaction Reference">{payment.transaction_ref || '—'}</Detail>
                <Detail label="Recorded">{formatDateTime(payment.created_at)}</Detail>
              </dl>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
