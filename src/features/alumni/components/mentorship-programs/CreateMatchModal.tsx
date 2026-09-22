import { useEffect, useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import AlumniPicker from '../profiles/AlumniPicker';
import { getProgramMentors } from '../../api/mentorshipPrograms.api';
import { getApiErrorMessage } from '../../utils/errors';
import { recordId } from '../../utils/records';
import { todayISO } from '../../utils/format';
import type { AlumniProfile, GenericRecord } from '../../types/profile.types';
import type { MatchCreatePayload } from '../../types/mentorship.types';

interface CreateMatchModalProps {
  isOpen: boolean;
  programId: string;
  onClose: () => void;
  onSubmit: (data: MatchCreatePayload) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function mentorLabel(mentor: GenericRecord): string {
  const alumniId = mentor.alumni_id;
  const bio = typeof mentor.bio === 'string' ? mentor.bio : '';
  const base = alumniId !== undefined ? `Alumni #${alumniId}` : `Mentor #${recordId(mentor, 'mentor_id')}`;
  return bio ? `${base} — ${bio.slice(0, 40)}` : base;
}

export default function CreateMatchModal({ isOpen, programId, onClose, onSubmit }: CreateMatchModalProps) {
  const [mentors, setMentors] = useState<GenericRecord[] | null>(null);
  const [mentorId, setMentorId] = useState('');
  const [menteeMode, setMenteeMode] = useState<'alumni' | 'external'>('alumni');
  const [menteeAlumni, setMenteeAlumni] = useState<AlumniProfile | null>(null);
  const [studentRef, setStudentRef] = useState('');
  const [menteeName, setMenteeName] = useState('');
  const [matchedDate, setMatchedDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getProgramMentors(programId)
      .then((result) => setMentors(Array.isArray(result.data) ? result.data : []))
      .catch(() => setMentors([]));
  }, [isOpen, programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        mentor_id: Number(mentorId),
        matched_date: matchedDate,
        ...(menteeMode === 'alumni'
          ? { mentee_alumni_id: menteeAlumni?.profile_id }
          : { mentee_student_ref: studentRef, mentee_name: menteeName }),
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create match'));
    } finally {
      setSubmitting(false);
    }
  };

  const menteeReady = menteeMode === 'alumni' ? !!menteeAlumni : studentRef.trim() && menteeName.trim();

  return (
    <Modal isOpen={isOpen} onClose={() => !submitting && onClose()} title="Create Match" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label htmlFor="mentor_id" className="block text-sm font-medium text-slate-700 mb-1">
            Mentor *
          </label>
          <select
            id="mentor_id"
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            disabled={!mentors}
            className={inputClass}
            required
          >
            <option value="">
              {!mentors ? 'Loading...' : mentors.length === 0 ? 'No mentors in this program' : 'Select a mentor'}
            </option>
            {mentors?.map((mentor) => {
              const id = recordId(mentor, 'mentor_id');
              return id ? (
                <option key={id} value={id}>
                  {mentorLabel(mentor)}
                </option>
              ) : null;
            })}
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1">Mentee *</span>
          <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden mb-2">
            <button
              type="button"
              onClick={() => setMenteeMode('alumni')}
              className={`px-3 py-1.5 text-sm font-medium ${menteeMode === 'alumni' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
            >
              Existing Alumni
            </button>
            <button
              type="button"
              onClick={() => setMenteeMode('external')}
              className={`px-3 py-1.5 text-sm font-medium ${menteeMode === 'external' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
            >
              Not Yet an Alumnus
            </button>
          </div>
          {menteeMode === 'alumni' ? (
            <AlumniPicker id="mentee_alumni" selected={menteeAlumni} onSelect={setMenteeAlumni} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={studentRef}
                onChange={(e) => setStudentRef(e.target.value)}
                placeholder="Student reference, e.g. STU-2026-0142"
                className={inputClass}
              />
              <input
                type="text"
                value={menteeName}
                onChange={(e) => setMenteeName(e.target.value)}
                placeholder="Mentee name"
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="matched_date" className="block text-sm font-medium text-slate-700 mb-1">
            Matched Date *
          </label>
          <input
            id="matched_date"
            type="date"
            value={matchedDate}
            onChange={(e) => setMatchedDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || !mentorId || !menteeReady}>
            {submitting ? 'Creating...' : 'Create Match'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
