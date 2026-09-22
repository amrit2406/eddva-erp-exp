import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { AlumniProfileFormData, AlumniProfileUpdateData } from '../../types/profile.types';

// The staff create form, the staff/self edit form, and the "register alumni +
// portal login" form share these fields; only create/register add a one-time
// password, only staff-facing forms show verification status directly
// (self-edit goes through the verification-request flow instead), and only
// register asks for a verification note.
export type ProfileFormValue = AlumniProfileFormData & { verification_note?: string };

interface ProfileFormProps {
  initialValues: ProfileFormValue;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  showPassword?: boolean;
  showVerificationStatus?: boolean;
  showVerificationNote?: boolean;
  onSubmit: (data: AlumniProfileUpdateData & { password?: string; verification_note?: string }) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const VISIBILITY_OPTIONS = ['public', 'alumni_only', 'private'];
const VERIFICATION_OPTIONS = ['pending', 'verified', 'rejected'];

export default function ProfileForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  showPassword = false,
  showVerificationStatus = false,
  showVerificationNote = false,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormValue>({ verification_note: '', ...initialValues });
  const set = <K extends keyof ProfileFormValue>(key: K, value: ProfileFormValue[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { password, verification_note, ...core } = form;
    onSubmit({
      ...core,
      batch_year: Number(core.batch_year),
      graduation_year: Number(core.graduation_year),
      ...(showPassword ? { password } : {}),
      ...(showVerificationNote ? { verification_note } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              id="full_name"
              type="text"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="aarav@example.com"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="student_ref" className="block text-sm font-medium text-slate-700 mb-1">
              Student Reference
            </label>
            <input
              id="student_ref"
              type="text"
              value={form.student_ref}
              onChange={(e) => set('student_ref', e.target.value)}
              placeholder="e.g. STU-2015-0142"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="admission_no" className="block text-sm font-medium text-slate-700 mb-1">
              Admission No
            </label>
            <input
              id="admission_no"
              type="text"
              value={form.admission_no}
              onChange={(e) => set('admission_no', e.target.value)}
              placeholder="e.g. ADM/2011/0142"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="batch_year" className="block text-sm font-medium text-slate-700 mb-1">
              Batch Year *
            </label>
            <input
              id="batch_year"
              type="number"
              value={Number.isNaN(form.batch_year) ? '' : form.batch_year}
              onChange={(e) => set('batch_year', e.target.value === '' ? NaN : Number(e.target.value))}
              placeholder="2015"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="graduation_year" className="block text-sm font-medium text-slate-700 mb-1">
              Graduation Year *
            </label>
            <input
              id="graduation_year"
              type="number"
              value={Number.isNaN(form.graduation_year) ? '' : form.graduation_year}
              onChange={(e) => set('graduation_year', e.target.value === '' ? NaN : Number(e.target.value))}
              placeholder="2015"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="program" className="block text-sm font-medium text-slate-700 mb-1">
              Program
            </label>
            <input
              id="program"
              type="text"
              value={form.program}
              onChange={(e) => set('program', e.target.value)}
              placeholder="e.g. MBA"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Career</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="current_company" className="block text-sm font-medium text-slate-700 mb-1">
              Current Company
            </label>
            <input
              id="current_company"
              type="text"
              value={form.current_company}
              onChange={(e) => set('current_company', e.target.value)}
              placeholder="e.g. Acme Corp"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="current_designation" className="block text-sm font-medium text-slate-700 mb-1">
              Current Designation
            </label>
            <input
              id="current_designation"
              type="text"
              value={form.current_designation}
              onChange={(e) => set('current_designation', e.target.value)}
              placeholder="e.g. Product Manager"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={form.industry}
              onChange={(e) => set('industry', e.target.value)}
              placeholder="e.g. Technology"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-slate-700 mb-1">
              LinkedIn URL
            </label>
            <input
              id="linkedin_url"
              type="url"
              value={form.linkedin_url}
              onChange={(e) => set('linkedin_url', e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Bangalore"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              placeholder="e.g. India"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Privacy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-slate-700 mb-1">
              Profile Visibility
            </label>
            <select
              id="visibility"
              value={form.visibility}
              onChange={(e) => set('visibility', e.target.value)}
              className={inputClass}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          {showVerificationStatus && (
            <div>
              <label htmlFor="verification_status" className="block text-sm font-medium text-slate-700 mb-1">
                Verification Status
              </label>
              <select
                id="verification_status"
                value={form.verification_status}
                onChange={(e) => set('verification_status', e.target.value)}
                className={inputClass}
              >
                {VERIFICATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {showVerificationNote && (
          <div className="mt-4">
            <label htmlFor="verification_note" className="block text-sm font-medium text-slate-700 mb-1">
              Verification Note
            </label>
            <textarea
              id="verification_note"
              value={form.verification_note ?? ''}
              onChange={(e) => set('verification_note', e.target.value)}
              rows={2}
              placeholder="How the verification status above was decided"
              className={inputClass}
            />
          </div>
        )}
        <div className="flex flex-wrap gap-6 mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.contact_visible}
              onChange={(e) => set('contact_visible', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Contact details visible
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.email_opt_in}
              onChange={(e) => set('email_opt_in', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Email opt-in
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.sms_opt_in}
              onChange={(e) => set('sms_opt_in', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            SMS opt-in
          </label>
        </div>
      </div>

      {showPassword && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Portal Login</h3>
          <div className="md:w-1/2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Temporary Password *
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Temp#Pass2026"
              className={inputClass}
              required
              minLength={8}
            />
          </div>
        </div>
      )}

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
