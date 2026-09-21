import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import GatePassSelect from '../../components/discipline/GatePassSelect';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { createDisciplineRecord, getResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { ACTION_SUGGESTIONS, CATEGORY_SUGGESTIONS, DISCIPLINE_RESOURCE, suggestionLabel } from '../../utils/discipline';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordId } from '../../utils/records';
import { todayISO } from '../../utils/residents';
import type { HostelResident } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function CreateDisciplinePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(DISCIPLINE_RESOURCE);
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [form, setForm] = useState({
    incident_date: todayISO(),
    category: '',
    description: '',
    action_taken: '',
    fine_amount: '',
    gate_pass_id: '',
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

  const changeResident = (next: HostelResident | null) => {
    setResident(next);
    // A gate pass belongs to one resident, so a different resident clears it.
    setForm((prev) => ({ ...prev, gate_pass_id: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) {
      setError('Select the resident involved.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const record = await createDisciplineRecord({ ...form, resident_id: String(resident.resident_id) });
      toast.success('Incident recorded');
      const id = recordId(record, 'discipline_record_id', 'record_id');
      navigate(id ? `/hostel/discipline/${id}` : '/hostel/discipline');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to record incident'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Incident</h1>
        <p className="text-slate-600 mt-1">Log a discipline incident and what was done about it</p>
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
                  <ResidentPicker id="resident_search" selected={resident} onSelect={changeResident} />
                </div>

                <div>
                  <label htmlFor="incident_date" className="block text-sm font-medium text-slate-700 mb-1">
                    Incident Date *
                  </label>
                  <input
                    id="incident_date"
                    type="date"
                    value={form.incident_date}
                    max={todayISO()}
                    onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    id="category"
                    type="text"
                    list="discipline-categories"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. curfew_violation"
                    className={inputClass}
                    required
                  />
                  <datalist id="discipline-categories">
                    {CATEGORY_SUGGESTIONS.map((category) => (
                      <option key={category} value={category}>
                        {suggestionLabel(category)}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="action_taken" className="block text-sm font-medium text-slate-700 mb-1">
                    Action Taken *
                  </label>
                  <input
                    id="action_taken"
                    type="text"
                    list="discipline-actions"
                    value={form.action_taken}
                    onChange={(e) => setForm({ ...form, action_taken: e.target.value })}
                    placeholder="e.g. warning"
                    className={inputClass}
                    required
                  />
                  <datalist id="discipline-actions">
                    {ACTION_SUGGESTIONS.map((action) => (
                      <option key={action} value={action}>
                        {suggestionLabel(action)}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="fine_amount" className="block text-sm font-medium text-slate-700 mb-1">
                    Fine (₹)
                  </label>
                  <input
                    id="fine_amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.fine_amount}
                    onChange={(e) => setForm({ ...form, fine_amount: e.target.value })}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="gate_pass_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Related Gate Pass
                  </label>
                  <GatePassSelect
                    id="gate_pass_id"
                    residentId={resident ? String(resident.resident_id) : ''}
                    value={form.gate_pass_id}
                    onChange={(gate_pass_id) => setForm({ ...form, gate_pass_id })}
                    placeholder="None"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="e.g. Returned 90 minutes after curfew without permission"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/discipline')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Record Incident'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
