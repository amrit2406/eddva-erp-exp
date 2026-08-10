import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { ENQUIRY_STATUS_OPTIONS, ENQUIRY_SOURCE_OPTIONS, ENQUIRY_CATEGORY_OPTIONS } from '../../constants/enquiry.constants';
import { cn } from '../../../../utils/cn';

interface EnquiryFiltersProps {
  className?: string;
}

export default function EnquiryFilters({ className }: EnquiryFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search enquiry..."
            className="pl-10"
          />
        </div>
      </div>
      <Input placeholder="Phone" className="w-40" />
      <Input placeholder="Email" className="w-40" />
      <Select
        placeholder="Source"
        options={ENQUIRY_SOURCE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Select
        placeholder="Category"
        options={ENQUIRY_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Select
        placeholder="Status"
        options={ENQUIRY_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Input type="date" className="w-40" />
    </div>
  );
}
