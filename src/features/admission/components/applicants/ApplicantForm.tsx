import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ApplicantFields from './ApplicantFields';
import type { ApplicantFormData } from '../../types/admission.types';

interface ApplicantFormProps {
  initialValues: ApplicantFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: ApplicantFormData) => void;
  onCancel: () => void;
}

export default function ApplicantForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: ApplicantFormProps) {
  const [form, setForm] = useState<ApplicantFormData>(initialValues);

  const set = <K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <ApplicantFields form={form} onChange={set} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
