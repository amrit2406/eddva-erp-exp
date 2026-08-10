import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { APPOINTMENT_STATUS_OPTIONS } from '../../constants/appointment.constants';
import { cn } from '../../../../utils/cn';

interface AppointmentFiltersProps {
  className?: string;
}

export default function AppointmentFilters({ className }: AppointmentFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search appointment..."
            className="pl-10"
          />
        </div>
      </div>
      <Input placeholder="Visitor Name" className="w-40" />
      <Input placeholder="Phone" className="w-40" />
      <Input placeholder="Host" className="w-40" />
      <Select
        placeholder="Status"
        options={APPOINTMENT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-40"
      />
      <Input type="date" className="w-40" placeholder="From Date" />
      <Input type="date" className="w-40" placeholder="To Date" />
    </div>
  );
}
