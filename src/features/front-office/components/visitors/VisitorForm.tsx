import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { ID_PROOF_TYPES } from '../../constants/visitor.constants';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeVisitorFormData } from '../../types/visitorRecord.types';

interface VisitorFormProps {
  formData: FrontOfficeVisitorFormData;
  onChange: (data: FrontOfficeVisitorFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function VisitorForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: VisitorFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.full_name}
            onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
            placeholder="Enter full name"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Type</label>
          <Input
            list="id-proof-type-suggestions"
            value={formData.id_proof_type}
            onChange={(e) => onChange({ ...formData, id_proof_type: e.target.value })}
            placeholder="e.g., Aadhaar"
          />
          <datalist id="id-proof-type-suggestions">
            {ID_PROOF_TYPES.map((opt) => (
              <option key={opt.value} value={opt.label} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Number</label>
          <Input
            value={formData.id_proof_number}
            onChange={(e) => onChange({ ...formData, id_proof_number: e.target.value })}
            placeholder="Enter ID proof number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
          <Input
            value={formData.photo_url}
            onChange={(e) => onChange({ ...formData, photo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
          <Input
            value={formData.organization}
            onChange={(e) => onChange({ ...formData, organization: e.target.value })}
            placeholder="Enter organization name"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
