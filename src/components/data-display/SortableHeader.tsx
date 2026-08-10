import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SortConfig } from '../../types/common';

interface SortableHeaderProps {
  column: string;
  label: string;
  sortConfig?: SortConfig;
  onSort: (column: string) => void;
}

export default function SortableHeader({ column, label, sortConfig, onSort }: SortableHeaderProps) {
  const getSortIcon = () => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return sortConfig.order === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-[#008BE9]" />
    ) : (
      <ArrowDown className="h-4 w-4 text-[#008BE9]" />
    );
  };

  return (
    <button
      onClick={() => onSort(column)}
      className={cn(
        'flex items-center gap-1 font-medium hover:text-[#008BE9] transition-colors',
        sortConfig?.key === column && 'text-[#008BE9]'
      )}
    >
      {label}
      {getSortIcon()}
    </button>
  );
}
