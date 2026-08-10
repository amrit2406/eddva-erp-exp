import Button from '../../../../components/ui/Button';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface ComplaintStatusActionsProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  className?: string;
}

export default function ComplaintStatusActions({ currentStatus, onStatusChange, className }: ComplaintStatusActionsProps) {
  const actions = [
    {
      status: 'in_progress',
      label: 'In Progress',
      icon: ArrowRight,
      variant: 'primary' as const,
      show: currentStatus === 'pending',
    },
    {
      status: 'resolved',
      label: 'Resolve',
      icon: Check,
      variant: 'primary' as const,
      show: currentStatus === 'pending' || currentStatus === 'in_progress',
    },
    {
      status: 'closed',
      label: 'Close',
      icon: Check,
      variant: 'secondary' as const,
      show: currentStatus === 'resolved',
    },
    {
      status: 'rejected',
      label: 'Reject',
      icon: X,
      variant: 'secondary' as const,
      show: currentStatus === 'pending' || currentStatus === 'in_progress',
    },
  ];

  const availableActions = actions.filter((action) => action.show);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {availableActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.status}
            variant={action.variant}
            size="sm"
            onClick={() => onStatusChange(action.status)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
