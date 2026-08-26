import Badge from '../../../../components/ui/Badge';
import type { ReservationStatus } from '../../types/library.types';

const VARIANT_BY_STATUS: Record<ReservationStatus, 'info' | 'warning' | 'success' | 'neutral' | 'danger'> = {
  pending: 'info',
  ready_for_pickup: 'warning',
  fulfilled: 'success',
  cancelled: 'neutral',
  expired: 'danger',
};

const LABEL_BY_STATUS: Record<ReservationStatus, string> = {
  pending: 'Pending',
  ready_for_pickup: 'Ready for Pickup',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export default function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status] ?? 'neutral'}>{LABEL_BY_STATUS[status] ?? status}</Badge>;
}
