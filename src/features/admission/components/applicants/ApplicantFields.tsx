import { useState } from 'react';
import { APPLICANT_GENDERS, type ApplicantFormData } from '../../types/admission.types';
import { todayInput } from '../../utils/format';

interface ApplicantFieldsProps {
  form: ApplicantFormData;
  onChange: <K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

// The applicant sections shared by the applicant form and the new-application form.
export default function ApplicantFields({ form, onChange: set }: ApplicantFieldsProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = form.photo_url.trim();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Applicant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelClass}>Full Name *</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="dob" className={labelClass}>Date of Birth *</label>
            <input
              id="dob"
              type="date"
              value={form.dob}
              max={todayInput()}
              onChange={(e) => set('dob', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className={labelClass}>Gender *</label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) => set('gender', e.target.value as ApplicantFormData['gender'])}
              className={`${inputClass} capitalize`}
              required
            >
              {APPLICANT_GENDERS.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="parent@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>Address</label>
            <textarea
              id="address"
              rows={2}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="12 Park Street, Kolkata"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Guardian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guardian_name" className={labelClass}>Guardian Name</label>
            <input
              id="guardian_name"
              type="text"
              value={form.guardian_name}
              onChange={(e) => set('guardian_name', e.target.value)}
              placeholder="e.g. Rohit Sharma"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="guardian_contact" className={labelClass}>Guardian Contact</label>
            <input
              id="guardian_contact"
              type="tel"
              value={form.guardian_contact}
              onChange={(e) => set('guardian_contact', e.target.value)}
              placeholder="+91 98765 43211"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Photo</h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div className="flex-1">
            <label htmlFor="photo_url" className={labelClass}>Photo URL</label>
            <input
              id="photo_url"
              type="url"
              value={form.photo_url}
              onChange={(e) => {
                set('photo_url', e.target.value);
                setPhotoFailed(false);
              }}
              placeholder="https://..."
              className={inputClass}
            />
            <p className="text-xs text-slate-500 mt-1">Link to the applicant's photo.</p>
          </div>
          {photoUrl && !photoFailed && (
            <img
              src={photoUrl}
              alt="Applicant preview"
              onError={() => setPhotoFailed(true)}
              className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
            />
          )}
          {photoUrl && photoFailed && (
            <div className="h-24 w-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-center text-xs text-slate-500 px-2">
              Preview unavailable
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
