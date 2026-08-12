import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { PURCHASE_PAYMENT_STATUS_OPTIONS } from '../../constants/purchase.constants';

export default function PurchaseRegisterFilters() {
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
          options={PURCHASE_PAYMENT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>
      <div className="sm:w-48">
        <Select
          placeholder="Vendor"
          options={[
            { value: 'V001', label: 'ABC Electronics Ltd' },
            { value: 'V002', label: 'XYZ Materials Corp' },
          ]}
        />
      </div>
    </div>
  );
}
