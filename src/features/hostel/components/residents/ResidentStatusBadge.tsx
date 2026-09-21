import Badge from '../../../../components/ui/Badge';
import { residentStatus } from '../../utils/residents';
import type { HostelResident } from '../../types/hostel.types';

const VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  suspended: 'warning',
  vacated: 'neutral',
  left: 'neutral',
  inactive: 'neutral',
};

export default function ResidentStatusBadge({ resident }: { resident: HostelResident }) {
  const status = residentStatus(resident);
  if (!status) return <span className="text-slate-400">—</span>;
  return (
    <Badge variant={VARIANTS[status] ?? 'info'} className="capitalize">
      {status}
    </Badge>
  );
}
