import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { GroupFormData } from '../../types/engagement.types';

interface GroupFormProps {
  initialValues: GroupFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: GroupFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const TYPE_SUGGESTIONS = ['batch', 'chapter', 'interest', 'committee'];

export default function GroupForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: GroupFormProps) {
  const [form, setForm] = useState<GroupFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Group Name *
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Class of 2015"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="group_type" className="block text-sm font-medium text-slate-700 mb-1">
            Group Type *
          </label>
          <input
            id="group_type"
            type="text"
            list="group-types"
            value={form.group_type}
            onChange={(e) => setForm({ ...form, group_type: e.target.value })}
            placeholder="e.g. batch"
            className={inputClass}
            required
          />
          <datalist id="group-types">
            {TYPE_SUGGESTIONS.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
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
