import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { BILLING_CYCLES, ROOM_TYPE_SUGGESTIONS, cycleLabel } from '../../utils/feePlans';
import type { FeePlanFormData } from '../../types/hostel.types';

interface FeePlanFormProps {
  initialValues: FeePlanFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: FeePlanFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function FeePlanForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: FeePlanFormProps) {
  const [form, setForm] = useState<FeePlanFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Plan Name *
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Double room with mess — monthly"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="room_type" className="block text-sm font-medium text-slate-700 mb-1">
            Room Type *
          </label>
          <input
            id="room_type"
            type="text"
            list="fee-plan-room-types"
            value={form.room_type}
            onChange={(e) => setForm({ ...form, room_type: e.target.value })}
            placeholder="e.g. double"
            className={inputClass}
            required
          />
          <datalist id="fee-plan-room-types">
            {ROOM_TYPE_SUGGESTIONS.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="billing_cycle" className="block text-sm font-medium text-slate-700 mb-1">
            Billing Cycle *
          </label>
          <input
            id="billing_cycle"
            type="text"
            list="fee-plan-cycles"
            value={form.billing_cycle}
            onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
            placeholder="e.g. monthly"
            className={inputClass}
            required
          />
          <datalist id="fee-plan-cycles">
            {BILLING_CYCLES.map((cycle) => (
              <option key={cycle} value={cycle}>
                {cycleLabel(cycle)}
              </option>
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
            Amount (₹) *
          </label>
          <input
            id="amount"
            type="number"
            min={0.01}
            step="0.01"
            value={Number.isNaN(form.amount) ? '' : form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? NaN : Number(e.target.value) })}
            placeholder="e.g. 6500"
            className={inputClass}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Charged once per billing cycle.</p>
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

      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.includes_mess}
            onChange={(e) => setForm({ ...form, includes_mess: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
          />
          Includes mess
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
          />
          Active
        </label>
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
