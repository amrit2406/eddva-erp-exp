import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import { cn } from '../../../../utils/cn';

interface VisitorFiltersProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function VisitorFilters({ value, onChange, className }: VisitorFiltersProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, phone, email, or organization..."
        className="pl-10"
      />
    </div>
  );
}
