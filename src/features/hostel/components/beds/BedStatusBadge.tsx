import Badge from '../../../../components/ui/Badge';
import { bedStatus } from '../../utils/beds';
import type { HostelBed } from '../../types/hostel.types';

const VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  vacant: 'success',
  occupied: 'info',
  reserved: 'warning',
  maintenance: 'danger',
};

export default function BedStatusBadge({ bed }: { bed: HostelBed }) {
  const status = bedStatus(bed);
  if (!status) return <span className="text-slate-400">—</span>;
  return (
    <Badge variant={VARIANTS[status] ?? 'neutral'} className="capitalize">
      {status}
    </Badge>
  );
}
