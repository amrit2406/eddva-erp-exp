import type { EnquiryStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';
import { formatLabel } from '../../utils/format';

const STYLES: Record<EnquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  follow_up: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-slate-100 text-slate-600',
};

export default function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.lost)}>
      {formatLabel(status)}
    </span>
  );
}
