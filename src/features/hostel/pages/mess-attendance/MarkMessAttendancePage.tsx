import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { getResident, markMessAttendance } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { statusLabel } from '../../utils/attendance';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { MEAL_TYPES, MESS_ATTENDANCE_RESOURCE, MESS_STATUSES, defaultMeal } from '../../utils/messAttendance';
import { todayISO } from '../../utils/residents';
import type { HostelResident } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function MarkMessAttendancePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(MESS_ATTENDANCE_RESOURCE);
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [form, setForm] = useState({ meal_date: todayISO(), meal_type: defaultMeal(), status: 'opted_in' });
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
      await markMessAttendance({ resident_id: String(resident.resident_id), ...form });
      toast.success('Meal attendance marked');
      navigate('/hostel/mess-attendance');
    } catch (err) {
      // e.g. this resident already has a record for that meal
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to mark meal attendance'));
    } finally {
      setSubmitting(false);
    }
  };

  const canMark = can('mark') || can('create');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mark Meal Attendance</h1>
        <p className="text-slate-600 mt-1">Record a single resident's meal</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !canMark ? (
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
                  <label htmlFor="meal_date" className="block text-sm font-medium text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    id="meal_date"
                    type="date"
                    value={form.meal_date}
                    onChange={(e) => setForm({ ...form, meal_date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="meal_type" className="block text-sm font-medium text-slate-700 mb-1">
                    Meal *
                  </label>
                  <select
                    id="meal_type"
                    value={form.meal_type}
                    onChange={(e) => setForm({ ...form, meal_type: e.target.value })}
                    className={inputClass}
                    required
                  >
                    {MEAL_TYPES.map((meal) => (
                      <option key={meal} value={meal}>
                        {statusLabel(meal)}
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
                    {MESS_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/mess-attendance')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Mark Meal'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
