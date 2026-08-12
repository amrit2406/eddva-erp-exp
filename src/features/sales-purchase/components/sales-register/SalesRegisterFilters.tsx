import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { SALES_PAYMENT_STATUS_OPTIONS } from '../../constants/sales.constants';

export default function SalesRegisterFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search invoices..."
          className="w-full"
        />
      </div>
      <div className="sm:w-40">
        <Input
          type="date"
          placeholder="From Date"
          className="w-full"
        />
      </div>
      <div className="sm:w-40">
        <Input
          type="date"
          placeholder="To Date"
          className="w-full"
        />
      </div>
      <div className="sm:w-48">
        <Select
          placeholder="Payment Status"
          options={SALES_PAYMENT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
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
