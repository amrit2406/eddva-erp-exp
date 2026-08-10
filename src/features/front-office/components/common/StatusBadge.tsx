import { cn } from '../../../../utils/cn';

interface StatusBadgeProps {
  status: string;
  variant?: 'visitor' | 'enquiry' | 'appointment' | 'complaint';
  className?: string;
}

export default function StatusBadge({ status, variant = 'visitor', className }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (variant === 'visitor') {
      switch (status) {
        case 'checked_in':
          return 'bg-green-100 text-green-800';
        case 'checked_out':
          return 'bg-slate-100 text-slate-800';
        default:
          return 'bg-slate-100 text-slate-800';
      }
    }
    if (variant === 'enquiry') {
      switch (status) {
        case 'open':
          return 'bg-slate-100 text-slate-800';
        case 'in_progress':
          return 'bg-blue-100 text-blue-800';
        case 'closed':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-slate-100 text-slate-800';
      }
    }
    if (variant === 'appointment') {
      switch (status) {
        case 'scheduled':
          return 'bg-slate-100 text-slate-800';
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        case 'no_show':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-slate-100 text-slate-800';
      }
    }
    if (variant === 'complaint') {
      switch (status) {
        case 'open':
          return 'bg-slate-100 text-slate-800';
        case 'in_progress':
          return 'bg-blue-100 text-blue-800';
        case 'resolved':
          return 'bg-green-100 text-green-800';
        case 'closed':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-slate-100 text-slate-800';
      }
    }
    return 'bg-slate-100 text-slate-800';
  };

  const getDisplayText = () => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(), className)}>
      {getDisplayText()}
    </span>
  );
}
