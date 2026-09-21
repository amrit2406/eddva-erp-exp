import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import TagInput from '../common/TagInput';
import { MEAL_SUGGESTIONS, WEEKDAYS, capitalize } from '../../utils/messMenu';
import type { MessMenuFormData } from '../../types/hostel.types';

interface MenuFormProps {
  initialValues: MessMenuFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: MessMenuFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function MenuForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: MenuFormProps) {
  const [form, setForm] = useState<MessMenuFormData>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setLocalError('Add at least one dish.');
      return;
    }
    setLocalError(null);
    onSubmit(form);
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="day_of_week" className="block text-sm font-medium text-slate-700 mb-1">
            Day *
          </label>
          <select
            id="day_of_week"
            value={form.day_of_week}
            onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            className={inputClass}
            required
          >
            {WEEKDAYS.map((day) => (
              <option key={day} value={day}>
                {capitalize(day)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="meal_type" className="block text-sm font-medium text-slate-700 mb-1">
            Meal *
          </label>
          <input
            id="meal_type"
            type="text"
            list="mess-meal-types"
            value={form.meal_type}
            onChange={(e) => setForm({ ...form, meal_type: e.target.value })}
            placeholder="e.g. breakfast"
            className={inputClass}
            required
          />
          <datalist id="mess-meal-types">
            {MEAL_SUGGESTIONS.map((meal) => (
              <option key={meal} value={meal} />
            ))}
          </datalist>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="items" className="block text-sm font-medium text-slate-700 mb-1">
            Dishes *
          </label>
          <TagInput
            id="items"
            value={form.items}
            onChange={(items) => setForm({ ...form, items })}
            placeholder="Type a dish and press Enter, e.g. Poha"
          />
          <p className="text-xs text-slate-500 mt-1">Press Enter or a comma after each dish.</p>
        </div>

        <div>
          <label htmlFor="effective_from" className="block text-sm font-medium text-slate-700 mb-1">
            Effective From *
          </label>
          <input
            id="effective_from"
            type="date"
            value={form.effective_from}
            onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
            className={inputClass}
            required
          />
        </div>
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
