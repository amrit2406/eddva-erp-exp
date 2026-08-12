import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { SALES_ORDER_STATUS_OPTIONS } from '../../constants/sales.constants';

export default function SalesOrderFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search sales orders..."
          className="w-full"
        />
      </div>
      <div className="sm:w-48">
        <Select
          placeholder="Status"
          options={SALES_ORDER_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>
      <div className="sm:w-48">
        <Select
          placeholder="Customer"
          options={[
            { value: 'C001', label: 'Tech Solutions Pvt Ltd' },
            { value: 'C002', label: 'Innovate Systems Inc' },
          ]}
        />
      </div>
    </div>
  );
}
