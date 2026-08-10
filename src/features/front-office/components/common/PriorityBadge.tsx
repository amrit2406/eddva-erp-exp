import { cn } from '../../../../utils/cn';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 text-slate-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getDisplayText = () => {
    return priority
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getPriorityColor(), className)}>
      {getDisplayText()}
    </span>
  );
}
