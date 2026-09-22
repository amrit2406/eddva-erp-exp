import Badge from '../../../../components/ui/Badge';

const VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'danger',
};

export default function VerificationBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-slate-400">—</span>;
  return (
    <Badge variant={VARIANTS[status.toLowerCase()] ?? 'neutral'} className="capitalize">
      {status}
    </Badge>
  );
}
