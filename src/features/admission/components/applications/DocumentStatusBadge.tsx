import type { DocumentStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STYLES: Record<DocumentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.pending)}>
      {status}
    </span>
  );
}
