import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { ID_PROOF_TYPES } from '../../constants/visitor.constants';
import { cn } from '../../../../utils/cn';

interface VisitorFormProps {
  defaultValues?: {
    fullName?: string;
    phone?: string;
    email?: string;
    idProofType?: string;
    idProofNumber?: string;
    organization?: string;
  };
  onSubmit?: (data: any) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function VisitorForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: VisitorFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="fullName"
            defaultValue={defaultValues?.fullName}
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            name="phone"
            defaultValue={defaultValues?.phone}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <Input
            name="email"
            type="email"
            defaultValue={defaultValues?.email}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Type</label>
          <Select
            name="idProofType"
            defaultValue={defaultValues?.idProofType}
            placeholder="Select ID proof type"
            options={ID_PROOF_TYPES.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Number</label>
          <Input
            name="idProofNumber"
            defaultValue={defaultValues?.idProofNumber}
            placeholder="Enter ID proof number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
          <Input
            name="photo"
            type="file"
            accept="image/*"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
          <Input
            name="organization"
            defaultValue={defaultValues?.organization}
            placeholder="Enter organization name"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
