import Badge from '../../../../components/ui/Badge';
import type { IssueStatus } from '../../types/library.types';

const VARIANT_BY_STATUS: Record<IssueStatus, 'info' | 'danger' | 'success'> = {
  issued: 'info',
  overdue: 'danger',
  returned: 'success',
};

const LABEL_BY_STATUS: Record<IssueStatus, string> = {
  issued: 'Issued',
  overdue: 'Overdue',
  returned: 'Returned',
};

export default function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status] ?? 'neutral'}>{LABEL_BY_STATUS[status] ?? status}</Badge>;
}
