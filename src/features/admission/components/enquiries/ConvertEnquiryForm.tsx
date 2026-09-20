import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ApplicantPicker from '../applicants/ApplicantPicker';
import SessionSelect from '../sessions/SessionSelect';
import ProgramSelect from './ProgramSelect';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { todayInput } from '../../utils/format';
import {
  APPLICANT_GENDERS,
  type Applicant,
  type ApplicantGender,
  type ConvertEnquiryData,
  type Enquiry,
} from '../../types/admission.types';

interface ConvertEnquiryFormProps {
  enquiry: Enquiry;
  submitting: boolean;
  error: string | null;
  onSubmit: (data: ConvertEnquiryData) => void;
  onCancel: () => void;
}

type ApplicantMode = 'new' | 'existing';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function ConvertEnquiryForm({ enquiry, submitting, error, onSubmit, onCancel }: ConvertEnquiryFormProps) {
  const { sessions, status: sessionsStatus, activeId } = useSessionOptions();
  const [sessionChoice, setSessionChoice] = useState<number | ''>('');
  const sessionId = sessionChoice !== '' ? sessionChoice : (activeId ?? '');
  const [programId, setProgramId] = useState<number | ''>(enquiry.program_id ?? '');
  const [applicationDate, setApplicationDate] = useState(todayInput());
  const [mode, setMode] = useState<ApplicantMode>('new');
  const [existing, setExisting] = useState<Applicant | null>(null);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<ApplicantGender>('male');
  const [address, setAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId === '' || programId === '') {
      setLocalError('Choose an academic session and a program.');
      return;
    }
    if (mode === 'existing' && !existing) {
      setLocalError('Search for and select the existing applicant, or switch to creating a new one.');
      return;
    }
    setLocalError(null);

    const payload: ConvertEnquiryData = {
      session_id: sessionId,
      program_id: programId,
      application_date: applicationDate,
    };
    if (mode === 'existing' && existing) {
      payload.applicant_id = existing.applicant_id;
    } else {
      payload.applicant_details = {
        dob,
        gender,
        ...(address.trim() && { address: address.trim() }),
        ...(guardianName.trim() && { guardian_name: guardianName.trim() }),
        ...(guardianContact.trim() && { guardian_contact: guardianContact.trim() }),
        ...(photoUrl.trim() && { photo_url: photoUrl.trim() }),
      };
    }
    onSubmit(payload);
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="session_id" className={labelClass}>Academic Session *</label>
            <SessionSelect
              id="session_id"
              sessions={sessions}
              status={sessionsStatus}
              value={sessionId}
              onChange={setSessionChoice}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="program_id" className={labelClass}>Program *</label>
            <ProgramSelect id="program_id" value={programId} onChange={setProgramId} className={inputClass} required />
          </div>

          <div>
            <label htmlFor="application_date" className={labelClass}>Application Date *</label>
            <input
              id="application_date"
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Applicant</h2>

        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50" role="tablist">
          {(['new', 'existing'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={mode === option}
              onClick={() => setMode(option)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option === 'new' ? 'Create new applicant' : 'Use existing applicant'}
            </button>
          ))}
        </div>

        {mode === 'existing' ? (
          <ApplicantPicker value={existing} onChange={setExisting} />
        ) : (
          <>
            <p className="text-sm text-slate-500">
              {enquiry.name}'s name, phone and email come from the enquiry. Add the remaining details below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dob" className={labelClass}>Date of Birth *</label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  max={todayInput()}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="gender" className={labelClass}>Gender *</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as ApplicantGender)}
                  className={`${inputClass} capitalize`}
                  required
                >
                  {APPLICANT_GENDERS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className={labelClass}>Address</label>
                <textarea
                  id="address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="guardian_name" className={labelClass}>Guardian Name</label>
                <input
                  id="guardian_name"
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="guardian_contact" className={labelClass}>Guardian Contact</label>
                <input
                  id="guardian_contact"
                  type="tel"
                  value={guardianContact}
                  onChange={(e) => setGuardianContact(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="photo_url" className={labelClass}>Photo URL</label>
                <input
                  id="photo_url"
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}
      </section>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Converting...' : 'Convert to Application'}
        </Button>
      </div>
    </form>
  );
}
