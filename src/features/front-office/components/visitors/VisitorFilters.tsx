import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { VISITOR_STATUS_OPTIONS } from '../../constants/visitor.constants';
import { cn } from '../../../../utils/cn';

interface VisitorFiltersProps {
  className?: string;
}

export default function VisitorFilters({ className }: VisitorFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-3 sm:gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px] w-full sm:w-auto w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search visitor..."
            className="pl-10"
          />
        </div>
      </div>
      <Input placeholder="Phone" className="w-full sm:w-40" />
      <Input placeholder="Email" className="w-full sm:w-40" />
      <Input placeholder="Organization" className="w-full sm:w-40" />
      <Input placeholder="Host" className="w-full sm:w-40" />
      <Select
        placeholder="Status"
        options={VISITOR_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-full sm:w-40"
      />
      <Input type="date" className="w-full sm:w-40" />
    </div>
  );
}
