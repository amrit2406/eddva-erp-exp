import { Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { APPOINTMENT_STATUS_OPTIONS } from '../../constants/appointment.constants';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeAppointmentStatus } from '../../types/appointmentRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

interface AppointmentFiltersValue {
  search: string;
  status: FrontOfficeAppointmentStatus | '';
  department_id: number | '';
  from: string;
  to: string;
}

interface AppointmentFiltersProps {
  value: AppointmentFiltersValue;
  onChange: (value: AppointmentFiltersValue) => void;
  departments: FrontOfficeDepartment[];
  className?: string;
}

export default function AppointmentFilters({ value, onChange, departments, className }: AppointmentFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="flex-1 min-w-[200px] w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Search by visitor name or phone..."
            className="pl-10"
          />
        </div>
      </div>
      <Select
        value={value.department_id}
        onChange={(e) => onChange({ ...value, department_id: e.target.value ? Number(e.target.value) : '' })}
        placeholder="All Departments"
        options={departments.map((d) => ({ value: String(d.department_id), label: d.name }))}
        className="w-full sm:w-44"
      />
      <Select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as FrontOfficeAppointmentStatus | '' })}
        placeholder="All Statuses"
        options={APPOINTMENT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        className="w-full sm:w-40"
      />
      <Input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="w-full sm:w-40"
      />
      <Input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="w-full sm:w-40"
      />
    </div>
  );
}
