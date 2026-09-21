import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import WardenSelect from './WardenSelect';
import type { BlockFormData } from '../../types/hostel.types';

interface BlockFormProps {
  initialValues: BlockFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: BlockFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const GENDER_SUGGESTIONS = ['boys', 'girls', 'mixed'];

export default function BlockForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: BlockFormProps) {
  const [form, setForm] = useState<BlockFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, total_floors: Number(form.total_floors) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Block Name *
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Block A — Boys"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="gender_type" className="block text-sm font-medium text-slate-700 mb-1">
            Gender Type *
          </label>
          <input
            id="gender_type"
            type="text"
            list="block-gender-types"
            value={form.gender_type}
            onChange={(e) => setForm({ ...form, gender_type: e.target.value })}
            placeholder="e.g. boys"
            className={inputClass}
            required
          />
          <datalist id="block-gender-types">
            {GENDER_SUGGESTIONS.map((gender) => (
              <option key={gender} value={gender} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="total_floors" className="block text-sm font-medium text-slate-700 mb-1">
            Total Floors *
          </label>
          <input
            id="total_floors"
            type="number"
            min={1}
            step={1}
            value={Number.isNaN(form.total_floors) ? '' : form.total_floors}
            onChange={(e) => setForm({ ...form, total_floors: e.target.value === '' ? NaN : Number(e.target.value) })}
            placeholder="e.g. 4"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="warden_user_id" className="block text-sm font-medium text-slate-700 mb-1">
            Warden
          </label>
          <WardenSelect
            id="warden_user_id"
            value={form.warden_user_id}
            onChange={(warden_user_id) => setForm({ ...form, warden_user_id })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
        />
        Active
      </label>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
