import Badge from '../../../../components/ui/Badge';

const VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  scheduled: 'success',
  upcoming: 'success',
  ongoing: 'success',
  completed: 'neutral',
  cancelled: 'danger',
};

export default function EventStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  return (
    <Badge variant={VARIANTS[status.toLowerCase()] ?? 'neutral'} className="capitalize">
      {status}
    </Badge>
  );
}
