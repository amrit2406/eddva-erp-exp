import type { RegistrationStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STYLES: Record<RegistrationStatus, string> = {
  registered: 'bg-blue-100 text-blue-700',
  appeared: 'bg-green-100 text-green-700',
  absent: 'bg-slate-100 text-slate-600',
};

export default function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.registered)}>
      {status}
    </span>
  );
}
