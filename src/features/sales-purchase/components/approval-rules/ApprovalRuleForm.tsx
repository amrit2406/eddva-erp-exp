import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { ApprovalRuleFormData, Role } from '../../types/sales-purchase.types';

interface ApprovalRuleFormProps {
  defaultValues?: ApprovalRuleFormData;
  roles?: Role[];
  onSubmit?: (data: ApprovalRuleFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function ApprovalRuleForm({
  defaultValues,
  roles = [],
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: ApprovalRuleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const data: ApprovalRuleFormData = {
      name: formData.get('name') as string,
      sequence: Number(formData.get('sequence')) || 1,
      is_active: formData.get('is_active') === 'true',
    };

    const minAmount = formData.get('min_amount') as string;
    if (minAmount) data.min_amount = Number(minAmount);

    const maxAmount = formData.get('max_amount') as string;
    if (maxAmount) data.max_amount = Number(maxAmount);

    const approverRoleId = formData.get('approver_role_id') as string;
    if (approverRoleId) data.approver_role_id = Number(approverRoleId);

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Rule Name <span className="text-red-500">*</span>
        </label>
        <Input
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="e.g., Above 50k requires Finance Head"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Min Amount</label>
          <Input
            name="min_amount"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.min_amount}
            placeholder="e.g., 50000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Amount</label>
          <Input
            name="max_amount"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.max_amount}
            placeholder="Leave blank for no upper limit"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Approver Role <span className="text-red-500">*</span>
          </label>
          <select
            name="approver_role_id"
            defaultValue={defaultValues?.approver_role_id ? String(defaultValues.approver_role_id) : ''}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select approver role</option>
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sequence <span className="text-red-500">*</span>
          </label>
          <Input
            name="sequence"
            type="number"
            min="1"
            defaultValue={defaultValues?.sequence || 1}
            placeholder="e.g., 1"
            required
          />
          <p className="text-xs text-slate-500 mt-1">Order in which matching rules are applied.</p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="is_active"
          value="true"
          defaultChecked={defaultValues?.is_active ?? true}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Active
      </label>
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
