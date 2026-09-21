import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { getResident, markAttendance } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { ATTENDANCE_SESSIONS, ATTENDANCE_STATUSES, defaultSession, statusLabel } from '../../utils/attendance';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { todayISO } from '../../utils/residents';
import type { HostelResident } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function MarkAttendancePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('attendance');
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [form, setForm] = useState({
    attendance_date: todayISO(),
    session: defaultSession(),
    status: 'present',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ?resident_id= pre-selects the resident when arriving from their page.
  const presetResidentId = searchParams.get('resident_id');
  useEffect(() => {
    if (!presetResidentId) return;
    let cancelled = false;
    getResident(presetResidentId)
      .then((data) => {
        if (!cancelled) setResident(data);
      })
      .catch(() => {
        // Leave the picker empty so a resident can be chosen manually.
      });
    return () => {
      cancelled = true;
    };
  }, [presetResidentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) {
      setError('Select a resident.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await markAttendance({ resident_id: resident.resident_id, ...form });
      toast.success('Attendance marked');
      navigate('/hostel/attendance');
    } catch (err) {
      // e.g. attendance for this resident, date and session already exists
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to mark attendance'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
        <p className="text-slate-600 mt-1">Record attendance for a single resident</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('mark') ? (
            <AccessNotice />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="resident_search" className="block text-sm font-medium text-slate-700 mb-1">
                    Resident *
                  </label>
                  <ResidentPicker id="resident_search" selected={resident} onSelect={setResident} />
                </div>

                <div>
                  <label htmlFor="attendance_date" className="block text-sm font-medium text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    id="attendance_date"
                    type="date"
                    value={form.attendance_date}
                    onChange={(e) => setForm({ ...form, attendance_date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="session" className="block text-sm font-medium text-slate-700 mb-1">
                    Session *
                  </label>
                  <select
                    id="session"
                    value={form.session}
                    onChange={(e) => setForm({ ...form, session: e.target.value })}
                    className={inputClass}
                    required
                  >
                    {ATTENDANCE_SESSIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputClass}
                    required
                  >
                    {ATTENDANCE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 mb-1">
                    Remarks
                  </label>
                  <input
                    id="remarks"
                    type="text"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Optional note"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/attendance')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Mark Attendance'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
