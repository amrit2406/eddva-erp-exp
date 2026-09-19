import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import type { Pagination } from '../../types/admission.types';

interface PaginationBarProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ pagination, onPageChange }: PaginationBarProps) {
  const { page, totalPages, total } = pagination;
  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <span>
        Page {page} of {Math.max(totalPages, 1)} · {total} total
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
