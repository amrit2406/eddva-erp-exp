import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import RoomSelect from '../../components/complaints/RoomSelect';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { createComplaint, getResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { CATEGORY_SUGGESTIONS, COMPLAINTS_RESOURCE, PRIORITIES } from '../../utils/complaints';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordId } from '../../utils/records';
import type { HostelResident } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function CreateComplaintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(COMPLAINTS_RESOURCE);
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [roomId, setRoomId] = useState('');
  const [form, setForm] = useState({ category: '', priority: 'medium', description: '' });
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
      setError('Select the resident raising the complaint.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const complaint = await createComplaint({ ...form, resident_id: String(resident.resident_id), room_id: roomId });
      toast.success('Complaint raised');
      const id = recordId(complaint, 'complaint_id');
      navigate(id ? `/hostel/complaints/${id}` : '/hostel/complaints');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to raise complaint'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Raise Complaint</h1>
        <p className="text-slate-600 mt-1">Report a repair or issue on a resident's behalf</p>
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
                  <label htmlFor="complaint_block" className="block text-sm font-medium text-slate-700 mb-1">
                    Room
                  </label>
                  <RoomSelect roomId={roomId} onChange={setRoomId} />
                  <p className="text-xs text-slate-500 mt-1">Leave blank for a common area.</p>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    id="category"
                    type="text"
                    list="complaint-categories"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. electrical"
                    className={inputClass}
                    required
                  />
                  <datalist id="complaint-categories">
                    {CATEGORY_SUGGESTIONS.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
                    Priority *
                  </label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className={`${inputClass} capitalize`}
                    required
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
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
                    placeholder="e.g. Ceiling fan makes a grinding noise and wobbles"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/complaints')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Raise Complaint'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
