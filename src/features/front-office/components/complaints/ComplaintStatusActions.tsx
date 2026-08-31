import Button from '../../../../components/ui/Button';
import { UserCog, Flag, ArrowUpCircle, Check, CheckCheck, RefreshCw } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeComplaintStatus } from '../../types/complaintRecord.types';

interface ComplaintStatusActionsProps {
  status: FrontOfficeComplaintStatus;
  onAssign: () => void;
  onChangePriority: () => void;
  onChangeStatus: () => void;
  onEscalate: () => void;
  onResolve: () => void;
  onCloseComplaint: () => void;
  className?: string;
}

export default function ComplaintStatusActions({
  status,
  onAssign,
  onChangePriority,
  onChangeStatus,
  onEscalate,
  onResolve,
  onCloseComplaint,
  className,
}: ComplaintStatusActionsProps) {
  const isActive = status === 'open' || status === 'in_progress';
  const notClosed = status !== 'closed';

  const actions = [
    { key: 'assign', label: 'Assign', icon: UserCog, variant: 'secondary' as const, show: notClosed, onClick: onAssign },
    { key: 'priority', label: 'Priority', icon: Flag, variant: 'secondary' as const, show: notClosed, onClick: onChangePriority },
    { key: 'escalate', label: 'Escalate', icon: ArrowUpCircle, variant: 'secondary' as const, show: isActive, onClick: onEscalate },
    { key: 'resolve', label: 'Resolve', icon: Check, variant: 'primary' as const, show: isActive, onClick: onResolve },
    { key: 'close', label: 'Close', icon: CheckCheck, variant: 'primary' as const, show: status === 'resolved', onClick: onCloseComplaint },
    { key: 'status', label: 'Change Status', icon: RefreshCw, variant: 'secondary' as const, show: true, onClick: onChangeStatus },
  ];

  const availableActions = actions.filter((action) => action.show);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {availableActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button key={action.key} variant={action.variant} size="sm" onClick={action.onClick}>
            <Icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
