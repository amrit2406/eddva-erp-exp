import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getPayments } from '../../api/hostel.api';
import { recordId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'payment_id');
  return id ? `/hostel/payments/${id}` : undefined;
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fee Payments</h1>
        <p className="text-slate-600 mt-1">
          Hostel fees received. Record a payment from the invoice it is for.
        </p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={getPayments} emptyMessage="No payments recorded yet" rowHref={rowHref} />
      </Card>
    </div>
  );
}
