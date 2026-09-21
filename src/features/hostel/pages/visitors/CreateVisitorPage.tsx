import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { createVisitor, getResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { nowDateTimeInput } from '../../utils/format';
import { recordId } from '../../utils/records';
import { VISITORS_RESOURCE } from '../../utils/visitors';
import type { HostelResident, VisitorFormData } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const RELATION_SUGGESTIONS = ['Father', 'Mother', 'Guardian', 'Sibling', 'Relative', 'Friend'];
const ID_PROOF_SUGGESTIONS = ['Aadhaar', 'Passport', 'Driving Licence', 'Voter ID', 'PAN'];

export default function CreateVisitorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(VISITORS_RESOURCE);
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [form, setForm] = useState<Omit<VisitorFormData, 'resident_id'>>({
    visitor_name: '',
    relation: '',
    id_proof_type: '',
    id_proof_number: '',
    purpose: '',
    in_time: nowDateTimeInput(),
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
      setError('Select the resident being visited.');
      return;
    }
    if (form.id_proof_type.trim() && !form.id_proof_number.trim()) {
      setError('Enter the ID proof number, or clear the ID proof type.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const visitor = await createVisitor({ ...form, resident_id: String(resident.resident_id) });
      toast.success('Visitor recorded');
      const id = recordId(visitor, 'visitor_id');
      navigate(id ? `/hostel/visitors/${id}` : '/hostel/visitors');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to record visitor'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Visitor</h1>
        <p className="text-slate-600 mt-1">Log a visitor arriving to see a resident</p>
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
                <div className="md:col-span-2">
                  <label htmlFor="resident_search" className="block text-sm font-medium text-slate-700 mb-1">
                    Resident being visited *
                  </label>
                  <ResidentPicker id="resident_search" selected={resident} onSelect={setResident} />
                </div>

                <div>
                  <label htmlFor="visitor_name" className="block text-sm font-medium text-slate-700 mb-1">
                    Visitor Name *
                  </label>
                  <input
                    id="visitor_name"
                    type="text"
                    value={form.visitor_name}
                    onChange={(e) => setForm({ ...form, visitor_name: e.target.value })}
                    placeholder="e.g. Rakesh Sharma"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="relation" className="block text-sm font-medium text-slate-700 mb-1">
                    Relation to Resident *
                  </label>
                  <input
                    id="relation"
                    type="text"
                    list="visitor-relations"
                    value={form.relation}
                    onChange={(e) => setForm({ ...form, relation: e.target.value })}
                    placeholder="e.g. Father"
                    className={inputClass}
                    required
                  />
                  <datalist id="visitor-relations">
                    {RELATION_SUGGESTIONS.map((relation) => (
                      <option key={relation} value={relation} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="id_proof_type" className="block text-sm font-medium text-slate-700 mb-1">
                    ID Proof Type
                  </label>
                  <input
                    id="id_proof_type"
                    type="text"
                    list="visitor-id-proofs"
                    value={form.id_proof_type}
                    onChange={(e) => setForm({ ...form, id_proof_type: e.target.value })}
                    placeholder="e.g. Aadhaar"
                    className={inputClass}
                  />
                  <datalist id="visitor-id-proofs">
                    {ID_PROOF_SUGGESTIONS.map((proof) => (
                      <option key={proof} value={proof} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="id_proof_number" className="block text-sm font-medium text-slate-700 mb-1">
                    ID Proof Number
                  </label>
                  <input
                    id="id_proof_number"
                    type="text"
                    value={form.id_proof_number}
                    onChange={(e) => setForm({ ...form, id_proof_number: e.target.value })}
                    placeholder="e.g. 1234-5678-9012"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="in_time" className="block text-sm font-medium text-slate-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    id="in_time"
                    type="datetime-local"
                    value={form.in_time}
                    onChange={(e) => setForm({ ...form, in_time: e.target.value })}
                    className={inputClass}
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave blank to use the current time.</p>
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-1">
                    Purpose of Visit *
                  </label>
                  <input
                    id="purpose"
                    type="text"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Parent meeting"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/visitors')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record Visitor'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
