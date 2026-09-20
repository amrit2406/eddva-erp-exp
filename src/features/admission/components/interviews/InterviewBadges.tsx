import type { InterviewRecommendation, InterviewStatus } from '../../types/admission.types';
import { cn } from '../../../../utils/cn';
import { formatLabel } from '../../utils/format';

const STATUS_STYLES: Record<InterviewStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-600',
  no_show: 'bg-red-100 text-red-700',
};

const RECOMMENDATION_STYLES: Record<InterviewRecommendation, string> = {
  recommend: 'bg-green-100 text-green-700',
  hold: 'bg-amber-100 text-amber-700',
  not_recommend: 'bg-red-100 text-red-700',
};

const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize';

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  return <span className={cn(base, STATUS_STYLES[status] ?? STATUS_STYLES.scheduled)}>{formatLabel(status)}</span>;
}

export function RecommendationBadge({ recommendation }: { recommendation: InterviewRecommendation }) {
  return (
    <span className={cn(base, RECOMMENDATION_STYLES[recommendation] ?? RECOMMENDATION_STYLES.hold)}>
      {formatLabel(recommendation)}
    </span>
  );
}
