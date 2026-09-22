import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import AlumniPicker from '../profiles/AlumniPicker';
import type { AlumniProfile } from '../../types/profile.types';
import type { MentorFormData } from '../../types/mentorship.types';

interface MentorFormProps {
  initialValues: MentorFormData;
  // Shown when editing an existing mentor whose alumni is already fixed.
  initialAlumni?: AlumniProfile | null;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  lockAlumni?: boolean;
  onSubmit: (data: MentorFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function MentorForm({
  initialValues,
  initialAlumni = null,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  lockAlumni = false,
  onSubmit,
  onCancel,
}: MentorFormProps) {
  const [form, setForm] = useState<MentorFormData>(initialValues);
  const [alumni, setAlumni] = useState<AlumniProfile | null>(initialAlumni);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, alumni_id: alumni ? String(alumni.profile_id) : form.alumni_id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="alumni_id" className="block text-sm font-medium text-slate-700 mb-1">
          Alumnus *
        </label>
        {lockAlumni ? (
          <input value={alumni ? alumni.full_name : `Alumni #${form.alumni_id}`} disabled className={inputClass} />
        ) : (
          <AlumniPicker id="alumni_id" selected={alumni} onSelect={setAlumni} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expertise_areas" className="block text-sm font-medium text-slate-700 mb-1">
            Expertise Areas
          </label>
          <input
            id="expertise_areas"
            type="text"
            value={form.expertise_areas}
            onChange={(e) => setForm({ ...form, expertise_areas: e.target.value })}
            placeholder="e.g. product management, career coaching"
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
        </div>
        <div>
          <label htmlFor="max_mentees" className="block text-sm font-medium text-slate-700 mb-1">
            Max Mentees
          </label>
          <input
            id="max_mentees"
            type="number"
            min={1}
            value={form.max_mentees}
            onChange={(e) => setForm({ ...form, max_mentees: e.target.value })}
            placeholder="e.g. 3"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="availability_note" className="block text-sm font-medium text-slate-700 mb-1">
            Availability
          </label>
          <input
            id="availability_note"
            type="text"
            value={form.availability_note}
            onChange={(e) => setForm({ ...form, availability_note: e.target.value })}
            placeholder="e.g. Weekends, evenings IST"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || (!lockAlumni && !alumni)}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
