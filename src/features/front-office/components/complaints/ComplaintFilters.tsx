import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { COMPLAINT_STATUS_OPTIONS, COMPLAINT_PRIORITY_OPTIONS } from '../../constants/complaint.constants';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeComplaintPriority, FrontOfficeComplaintStatus } from '../../types/complaintRecord.types';

interface ComplaintFiltersValue {
  search: string;
  category: string;
  priority: FrontOfficeComplaintPriority | '';
  status: FrontOfficeComplaintStatus | '';
}

interface ComplaintFiltersProps {
  value: ComplaintFiltersValue;
  onChange: (value: ComplaintFiltersValue) => void;
  className?: string;
}

export default function ComplaintFilters({ value, onChange, className }: ComplaintFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px] w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Search by complainant name or phone..."
            className="pl-10"
          />
        </div>
      </div>
      <Input
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
        placeholder="Category"
        className="w-full sm:w-40"
      />
      <Select
        value={value.priority}
        onChange={(e) => onChange({ ...value, priority: e.target.value as FrontOfficeComplaintPriority | '' })}
        placeholder="All Priorities"
        options={COMPLAINT_PRIORITY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-full sm:w-40"
      />
      <Select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as FrontOfficeComplaintStatus | '' })}
        placeholder="All Statuses"
        options={COMPLAINT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-full sm:w-40"
      />
    </div>
  );
}
