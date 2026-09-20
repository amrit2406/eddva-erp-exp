import type { ApplicationStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';
import { formatLabel } from '../../utils/format';

const STYLES: Record<ApplicationStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-purple-100 text-purple-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STYLES[status] ?? STYLES.draft)}>
      {formatLabel(status)}
    </span>
  );
}
