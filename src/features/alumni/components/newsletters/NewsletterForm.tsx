import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import SegmentBuilder from './SegmentBuilder';
import SegmentPreviewButton from './SegmentPreviewButton';
import type { NewsletterFormData } from '../../types/newsletters.types';

interface NewsletterFormProps {
  initialValues: NewsletterFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: NewsletterFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function NewsletterForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: NewsletterFormProps) {
  const [form, setForm] = useState<NewsletterFormData>(initialValues);

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
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Alumni Meet 2026 — save the date"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
          Content *
        </label>
        <textarea
          id="content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={8}
          className={inputClass}
          required
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Audience</h3>
        <SegmentBuilder value={form.target_segment} onChange={(target_segment) => setForm({ ...form, target_segment })} />
        <div className="mt-3">
          <SegmentPreviewButton segment={form.target_segment} />
        </div>
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
