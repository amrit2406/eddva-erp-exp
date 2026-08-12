import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { VENDOR_STATUS_OPTIONS } from '../../constants/vendor.constants';

export default function VendorFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search vendors..."
          className="w-full"
        />
      </div>
      <div className="sm:w-48">
        <Select
          placeholder="Status"
          options={VENDOR_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>
      <div className="sm:w-48">
        <Select
          placeholder="City"
          options={[
            { value: 'bangalore', label: 'Bangalore' },
            { value: 'mumbai', label: 'Mumbai' },
            { value: 'chennai', label: 'Chennai' },
          ]}
        />
      </div>
    </div>
  );
}
