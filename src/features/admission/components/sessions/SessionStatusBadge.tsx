import type { SessionStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STYLES: Record<SessionStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-600',
};

export default function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.closed)}>
      {status}
    </span>
  );
}
