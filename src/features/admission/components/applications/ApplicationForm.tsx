import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ApplicantFields from '../applicants/ApplicantFields';
import ApplicantPicker from '../applicants/ApplicantPicker';
import ProgramSelect from '../enquiries/ProgramSelect';
import SessionSelect from '../sessions/SessionSelect';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { todayInput } from '../../utils/format';
import type { Applicant, ApplicantFormData, ApplicationCreateData } from '../../types/admission.types';

export interface ApplicationFormValues {
  session_id: number | '';
  program_id: number | '';
  application_date: string;
}

interface ApplicationFormProps {
  // Editing changes the session/program/date only; the applicant is fixed.
  mode: 'create' | 'edit';
  initialValues: ApplicationFormValues;
  applicantSummary?: string;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: ApplicationCreateData) => void;
  onCancel: () => void;
}

type ApplicantMode = 'new' | 'existing';

const EMPTY_APPLICANT: ApplicantFormData = {
  name: '',
  dob: '',
  gender: 'male',
  email: '',
  phone: '',
  address: '',
  guardian_name: '',
  guardian_contact: '',
  photo_url: '',
};

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function ApplicationForm({
  mode,
  initialValues,
  applicantSummary,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const { sessions, status: sessionsStatus, activeId } = useSessionOptions();
  const [sessionChoice, setSessionChoice] = useState<number | ''>(initialValues.session_id);
  const sessionId = sessionChoice !== '' ? sessionChoice : mode === 'create' ? (activeId ?? '') : '';
  const [programId, setProgramId] = useState<number | ''>(initialValues.program_id);
  const [applicationDate, setApplicationDate] = useState(initialValues.application_date || todayInput());
  const [sourceEnquiryId, setSourceEnquiryId] = useState<number | ''>('');
  const [applicantMode, setApplicantMode] = useState<ApplicantMode>('new');
  const [existing, setExisting] = useState<Applicant | null>(null);
  const [applicant, setApplicant] = useState<ApplicantFormData>(EMPTY_APPLICANT);
  const [localError, setLocalError] = useState<string | null>(null);

  const setApplicantField = <K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) =>
    setApplicant((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId === '' || programId === '') {
      setLocalError('Choose an academic session and a program.');
      return;
    }
    if (mode === 'create' && applicantMode === 'existing' && !existing) {
      setLocalError('Search for and select the existing applicant, or switch to entering a new one.');
      return;
    }
    setLocalError(null);

    const payload: ApplicationCreateData = {
      session_id: sessionId,
      program_id: programId,
      application_date: applicationDate,
    };
    if (mode === 'create') {
      if (applicantMode === 'existing' && existing) payload.applicant_id = existing.applicant_id;
      else payload.applicant = applicant;
      if (sourceEnquiryId !== '') payload.source_enquiry_id = sourceEnquiryId;
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
        {mode === 'edit' && applicantSummary && (
          <p className="text-sm text-slate-600">
            Applicant: <span className="font-medium text-slate-900">{applicantSummary}</span>
          </p>
        )}
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

          {mode === 'create' && (
            <div>
              <label htmlFor="source_enquiry_id" className={labelClass}>Source Enquiry ID</label>
              <input
                id="source_enquiry_id"
                type="number"
                min={1}
                value={sourceEnquiryId}
                onChange={(e) => setSourceEnquiryId(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Optional"
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">Links this application back to the enquiry it came from.</p>
            </div>
          )}
        </div>
      </section>

      {mode === 'create' && (
        <section className="space-y-4">
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50" role="tablist">
            {(['new', 'existing'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={applicantMode === option}
                onClick={() => setApplicantMode(option)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  applicantMode === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option === 'new' ? 'New applicant' : 'Existing applicant'}
              </button>
            ))}
          </div>

          {applicantMode === 'existing' ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Applicant</h2>
              <ApplicantPicker value={existing} onChange={setExisting} />
            </div>
          ) : (
            <ApplicantFields form={applicant} onChange={setApplicantField} />
          )}
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
