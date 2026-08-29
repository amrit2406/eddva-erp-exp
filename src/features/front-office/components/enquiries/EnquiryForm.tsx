import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { ENQUIRY_SOURCE_OPTIONS, ENQUIRY_CATEGORY_OPTIONS } from '../../constants/enquiry.constants';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeEnquiryFormData, FrontOfficeEnquirySource } from '../../types/enquiryRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

interface EnquiryFormProps {
  formData: FrontOfficeEnquiryFormData;
  onChange: (data: FrontOfficeEnquiryFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  employees?: FrontOfficeEmployee[];
  showAssignee?: boolean;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function EnquiryForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  employees = [],
  showAssignee = false,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: EnquiryFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Enquirer Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.enquirer_name}
            onChange={(e) => onChange({ ...formData, enquirer_name: e.target.value })}
            placeholder="Enter enquirer name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Source <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.source}
            onChange={(e) => onChange({ ...formData, source: e.target.value as FrontOfficeEnquirySource })}
            options={ENQUIRY_SOURCE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Input
            list="enquiry-category-suggestions"
            value={formData.category}
            onChange={(e) => onChange({ ...formData, category: e.target.value })}
            placeholder="e.g., admission"
            required
          />
          <datalist id="enquiry-category-suggestions">
            {ENQUIRY_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} />
            ))}
          </datalist>
        </div>
        {showAssignee && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
            <select
              value={formData.assigned_to ?? ''}
              onChange={(e) => onChange({ ...formData, assigned_to: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            >
              <option value="">Not assigned</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} {emp.department?.name ? `(${emp.department.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="Describe the enquiry"
            rows={4}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
