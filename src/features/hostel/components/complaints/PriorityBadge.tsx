import Badge from '../../../../components/ui/Badge';

const VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
  critical: 'danger',
};

export default function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const key = priority.toLowerCase();
  return (
    <Badge variant={VARIANTS[key] ?? 'neutral'} className="capitalize">
      {key} priority
    </Badge>
  );
}
