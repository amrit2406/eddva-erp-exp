import type { OfferStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STYLES: Record<OfferStatus, string> = {
  issued: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-600',
};

export default function OfferStatusBadge({ status }: { status: OfferStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.issued)}>
      {status}
    </span>
  );
}
