import type { ConfirmationStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STYLES: Record<ConfirmationStatus, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function ConfirmationStatusBadge({ status }: { status: ConfirmationStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.confirmed)}>
      {status}
    </span>
  );
}
