import type { MeritListStatus, MeritOutcome } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';

const STATUS_STYLES: Record<MeritListStatus, string> = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
};

const OUTCOME_STYLES: Record<MeritOutcome, string> = {
  selected: 'bg-green-100 text-green-700',
  waitlisted: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
};

const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize';

export function MeritStatusBadge({ published }: { published: boolean }) {
  const status: MeritListStatus = published ? 'published' : 'draft';
  return <span className={cn(base, STATUS_STYLES[status])}>{status}</span>;
}

export function OutcomeBadge({ outcome }: { outcome: MeritOutcome }) {
  return <span className={cn(base, OUTCOME_STYLES[outcome] ?? OUTCOME_STYLES.waitlisted)}>{outcome}</span>;
}
