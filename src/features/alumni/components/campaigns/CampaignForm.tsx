import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { CampaignFormData } from '../../types/fundraising.types';

interface CampaignFormProps {
  initialValues: CampaignFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function CampaignForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: CampaignFormProps) {
  const [form, setForm] = useState<CampaignFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Campaign Title *
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. New Library Wing"
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="goal_amount" className="block text-sm font-medium text-slate-700 mb-1">
            Goal Amount *
          </label>
          <input
            id="goal_amount"
            type="number"
            min={0}
            step="0.01"
            value={form.goal_amount}
            onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
            placeholder="1000000"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1">
            Start Date *
          </label>
          <input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1">
            End Date *
          </label>
          <input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className={inputClass}
            required
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
          rows={4}
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
