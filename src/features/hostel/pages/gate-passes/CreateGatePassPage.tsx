import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { createGatePass, getResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordId } from '../../utils/records';
import type { GatePassFormData, HostelResident } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const PASS_TYPE_SUGGESTIONS = ['day_outing', 'home_leave', 'medical', 'emergency'];

export default function CreateGatePassPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('gate_passes');
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [form, setForm] = useState<Omit<GatePassFormData, 'resident_id'>>({
    pass_type: '',
    reason: '',
    destination: '',
    requested_out_at: '',
    expected_return_at: '',
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
    if (new Date(form.expected_return_at) <= new Date(form.requested_out_at)) {
      setError('Expected return must be after the time of leaving.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const pass = await createGatePass({ ...form, resident_id: String(resident.resident_id) });
      toast.success('Gate pass created');
      const id = recordId(pass, 'gate_pass_id', 'pass_id');
      navigate(id ? `/hostel/gate-passes/${id}` : '/hostel/gate-passes');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create gate pass'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Gate Pass</h1>
        <p className="text-slate-600 mt-1">Request permission for a resident to leave the hostel</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resident_search" className="block text-sm font-medium text-slate-700 mb-1">
                    Resident *
                  </label>
                  <ResidentPicker id="resident_search" selected={resident} onSelect={setResident} />
                </div>

                <div>
                  <label htmlFor="pass_type" className="block text-sm font-medium text-slate-700 mb-1">
                    Pass Type *
                  </label>
                  <input
                    id="pass_type"
                    type="text"
                    list="gate-pass-types"
                    value={form.pass_type}
                    onChange={(e) => setForm({ ...form, pass_type: e.target.value })}
                    placeholder="e.g. day_outing"
                    className={inputClass}
                    required
                  />
                  <datalist id="gate-pass-types">
                    {PASS_TYPE_SUGGESTIONS.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="requested_out_at" className="block text-sm font-medium text-slate-700 mb-1">
                    Leaving At *
                  </label>
                  <input
                    id="requested_out_at"
                    type="datetime-local"
                    value={form.requested_out_at}
                    onChange={(e) => setForm({ ...form, requested_out_at: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="expected_return_at" className="block text-sm font-medium text-slate-700 mb-1">
                    Expected Return *
                  </label>
                  <input
                    id="expected_return_at"
                    type="datetime-local"
                    value={form.expected_return_at}
                    onChange={(e) => setForm({ ...form, expected_return_at: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">
                    Destination *
                  </label>
                  <input
                    id="destination"
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="e.g. City Dental Clinic, MG Road"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    id="reason"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    rows={3}
                    placeholder="e.g. Dental appointment"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/gate-passes')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Gate Pass'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
