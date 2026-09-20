import type { PaymentStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.pending)}>
      {status}
    </span>
  );
}
