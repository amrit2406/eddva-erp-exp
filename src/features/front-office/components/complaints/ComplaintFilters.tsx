import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { COMPLAINT_STATUS_OPTIONS, COMPLAINT_CATEGORY_OPTIONS, COMPLAINT_PRIORITY_OPTIONS } from '../../constants/complaint.constants';
import { cn } from '../../../../utils/cn';

interface ComplaintFiltersProps {
  className?: string;
}

export default function ComplaintFilters({ className }: ComplaintFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search complaint..."
            className="pl-10"
          />
        </div>
      </div>
      <Input placeholder="Complainant" className="w-40" />
      <Input placeholder="Phone" className="w-40" />
      <Select
        placeholder="Category"
        options={COMPLAINT_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Select
        placeholder="Priority"
        options={COMPLAINT_PRIORITY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Select
        placeholder="Status"
        options={COMPLAINT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Input type="date" className="w-40" />
    </div>
  );
}
