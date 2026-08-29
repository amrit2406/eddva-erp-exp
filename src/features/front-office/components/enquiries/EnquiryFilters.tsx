import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { ENQUIRY_STATUS_OPTIONS, ENQUIRY_SOURCE_OPTIONS } from '../../constants/enquiry.constants';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeEnquirySource, FrontOfficeEnquiryStatus } from '../../types/enquiryRecord.types';

interface EnquiryFiltersValue {
  search: string;
  source: FrontOfficeEnquirySource | '';
  status: FrontOfficeEnquiryStatus | '';
  category: string;
}

interface EnquiryFiltersProps {
  value: EnquiryFiltersValue;
  onChange: (value: EnquiryFiltersValue) => void;
  className?: string;
}

export default function EnquiryFilters({ value, onChange, className }: EnquiryFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px] w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Search by name, phone, or email..."
            className="pl-10"
          />
        </div>
      </div>
      <Select
        value={value.source}
        onChange={(e) => onChange({ ...value, source: e.target.value as FrontOfficeEnquirySource | '' })}
        placeholder="All Sources"
        options={ENQUIRY_SOURCE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-full sm:w-40"
      />
      <Input
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
        placeholder="Category"
        className="w-full sm:w-40"
      />
      <Select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as FrontOfficeEnquiryStatus | '' })}
        placeholder="All Statuses"
        options={ENQUIRY_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-full sm:w-40"
      />
    </div>
  );
}
