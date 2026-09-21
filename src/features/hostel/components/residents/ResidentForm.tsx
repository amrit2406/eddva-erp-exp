import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { ResidentFormData } from '../../types/hostel.types';

interface ResidentFormProps {
  initialValues: ResidentFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  // The student reference and admission number can't change once created.
  lockIdentity?: boolean;
  onSubmit: (data: ResidentFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

const GENDER_SUGGESTIONS = ['male', 'female', 'other'];

export default function ResidentForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  lockIdentity,
  onSubmit,
  onCancel,
}: ResidentFormProps) {
  const [form, setForm] = useState<ResidentFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const field = (name: keyof ResidentFormData) => ({
    id: name,
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [name]: e.target.value }),
    className: inputClass,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Student</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="student_ref" className="block text-sm font-medium text-slate-700 mb-1">
              Student Reference *
            </label>
            <input {...field('student_ref')} type="text" placeholder="e.g. STU-2026-0142" disabled={lockIdentity} required />
          </div>
          <div>
            <label htmlFor="admission_no" className="block text-sm font-medium text-slate-700 mb-1">
              Admission No *
            </label>
            <input {...field('admission_no')} type="text" placeholder="e.g. ADM/2026/0142" disabled={lockIdentity} required />
          </div>
          <div>
            <label htmlFor="student_name" className="block text-sm font-medium text-slate-700 mb-1">
              Student Name *
            </label>
            <input {...field('student_name')} type="text" placeholder="e.g. Aarav Sharma" required />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
              Gender *
            </label>
            <input {...field('gender')} type="text" list="resident-genders" placeholder="e.g. male" required />
            <datalist id="resident-genders">
              {GENDER_SUGGESTIONS.map((gender) => (
                <option key={gender} value={gender} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">
              Grade
            </label>
            <input {...field('grade')} type="text" placeholder="e.g. Grade 9-B" />
          </div>
          <div>
            <label htmlFor="admitted_on" className="block text-sm font-medium text-slate-700 mb-1">
              Admitted On
            </label>
            <input {...field('admitted_on')} type="date" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Guardian</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="guardian_name" className="block text-sm font-medium text-slate-700 mb-1">
              Guardian Name
            </label>
            <input {...field('guardian_name')} type="text" placeholder="e.g. Rakesh Sharma" />
          </div>
          <div>
            <label htmlFor="guardian_phone" className="block text-sm font-medium text-slate-700 mb-1">
              Guardian Phone
            </label>
            <input {...field('guardian_phone')} type="tel" placeholder="e.g. +91 98765 43210" />
          </div>
          <div>
            <label htmlFor="guardian_email" className="block text-sm font-medium text-slate-700 mb-1">
              Guardian Email
            </label>
            <input {...field('guardian_email')} type="email" placeholder="e.g. rakesh@example.com" />
          </div>
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
