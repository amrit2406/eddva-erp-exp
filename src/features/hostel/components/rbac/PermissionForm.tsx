import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import type { HostelPermissionFormData } from '../../types/role.types';

interface PermissionFormProps {
  value: HostelPermissionFormData;
  onChange: (value: HostelPermissionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  showActive?: boolean;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function PermissionForm({
  value,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
  showActive = false,
}: PermissionFormProps) {
  const navigate = useNavigate();
  const set = (patch: Partial<HostelPermissionFormData>) => onChange({ ...value, ...patch });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="resource" className="block text-sm font-medium text-slate-700 mb-1">
            Resource *
          </label>
          <input
            type="text"
            id="resource"
            value={value.resource}
            onChange={(e) => set({ resource: e.target.value })}
            placeholder="e.g., gate_passes"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="action" className="block text-sm font-medium text-slate-700 mb-1">
            Action *
          </label>
          <input
            type="text"
            id="action"
            value={value.action}
            onChange={(e) => set({ action: e.target.value })}
            placeholder="e.g., export"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g., Export Gate Passes"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            id="category"
            value={value.category}
            onChange={(e) => set({ category: e.target.value })}
            placeholder="e.g., Gate Passes"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
          placeholder="e.g., Allows exporting gate pass records"
          className={inputClass}
          required
        />
      </div>

      {showActive && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={value.is_active ?? true}
            onChange={(e) => set({ is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
          />
          Active
        </label>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={() => navigate('/hostel/permissions')} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
