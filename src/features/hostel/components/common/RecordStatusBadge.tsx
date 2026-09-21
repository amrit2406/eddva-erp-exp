import Badge from '../../../../components/ui/Badge';

const VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  present: 'success',
  absent: 'danger',
  late: 'warning',
  approved: 'success',
  completed: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
  canceled: 'neutral',
  vacated: 'neutral',
};

export default function RecordStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <Badge variant={VARIANTS[status] ?? 'info'} className="capitalize">
      {status}
    </Badge>
  );
}
