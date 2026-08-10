import Button from '../../../../components/ui/Button';
import { Check, X, Clock } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface AppointmentStatusActionsProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  className?: string;
}

export default function AppointmentStatusActions({ currentStatus, onStatusChange, className }: AppointmentStatusActionsProps) {
  const actions = [
    {
      status: 'scheduled',
      label: 'Schedule',
      icon: Clock,
      variant: 'secondary' as const,
      show: currentStatus !== 'scheduled',
    },
    {
      status: 'confirmed',
      label: 'Confirm',
      icon: Check,
      variant: 'primary' as const,
      show: currentStatus !== 'confirmed' && currentStatus !== 'completed' && currentStatus !== 'cancelled',
    },
    {
      status: 'completed',
      label: 'Complete',
      icon: Check,
      variant: 'primary' as const,
      show: currentStatus !== 'completed' && currentStatus !== 'cancelled',
    },
    {
      status: 'cancelled',
      label: 'Cancel',
      icon: X,
      variant: 'secondary' as const,
      show: currentStatus !== 'cancelled' && currentStatus !== 'completed',
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
