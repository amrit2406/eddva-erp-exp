import Button from '../../../../components/ui/Button';
import { Check, X, CalendarClock, UserX, CheckCheck } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeAppointmentStatus } from '../../types/appointmentRecord.types';

interface AppointmentStatusActionsProps {
  status: FrontOfficeAppointmentStatus;
  onConfirm: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onReschedule: () => void;
  className?: string;
}

export default function AppointmentStatusActions({
  status,
  onConfirm,
  onComplete,
  onCancel,
  onNoShow,
  onReschedule,
  className,
}: AppointmentStatusActionsProps) {
  const isOpenState = status === 'scheduled' || status === 'confirmed';

  const actions = [
    {
      key: 'confirm',
      label: 'Confirm',
      icon: Check,
      variant: 'primary' as const,
      show: status === 'scheduled',
      onClick: onConfirm,
    },
    {
      key: 'complete',
      label: 'Complete',
      icon: CheckCheck,
      variant: 'primary' as const,
      show: isOpenState,
      onClick: onComplete,
    },
    {
      key: 'reschedule',
      label: 'Reschedule',
      icon: CalendarClock,
      variant: 'secondary' as const,
      show: isOpenState,
      onClick: onReschedule,
    },
    {
      key: 'no_show',
      label: 'No Show',
      icon: UserX,
      variant: 'secondary' as const,
      show: isOpenState,
      onClick: onNoShow,
    },
    {
      key: 'cancel',
      label: 'Cancel',
      icon: X,
      variant: 'danger' as const,
      show: isOpenState,
      onClick: onCancel,
    },
  ];

  const availableActions = actions.filter((action) => action.show);
  if (availableActions.length === 0) return null;

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
