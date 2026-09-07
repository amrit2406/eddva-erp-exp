import Button from '../../../../components/ui/Button';

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onSubmit: () => void;
  required?: boolean;
}

export default function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSubmit,
  required = true,
}: DateRangeFilterProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          required={required}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          required={required}
        />
      </div>
      <Button type="submit" variant="secondary" size="sm" disabled={required && (!fromDate || !toDate)}>
        Apply
      </Button>
    </form>
  );
}
