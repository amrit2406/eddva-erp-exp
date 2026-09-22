import Badge from '../../../../components/ui/Badge';

const VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  completed: 'success',
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
  canceled: 'neutral',
  ended: 'neutral',
};

export default function RecordStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <Badge variant={VARIANTS[status] ?? 'info'} className="capitalize">
      {status}
    </Badge>
  );
}
