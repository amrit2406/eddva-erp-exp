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
  // mess attendance
  opted_in: 'success',
  opted_out: 'neutral',
  attended: 'success',
  // complaints
  open: 'warning',
  assigned: 'info',
  in_progress: 'info',
  on_hold: 'neutral',
  resolved: 'success',
  closed: 'neutral',
  // fee invoices
  paid: 'success',
  partially_paid: 'warning',
  partial: 'warning',
  unpaid: 'warning',
  due: 'warning',
  overdue: 'danger',
  void: 'neutral',
};

export default function RecordStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <Badge variant={VARIANTS[status] ?? 'info'} className="capitalize">
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
