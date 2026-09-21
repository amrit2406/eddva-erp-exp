import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import FeePlanSelect from '../../components/fee-plans/FeePlanSelect';
import ResidentPicker from '../../components/gate-passes/ResidentPicker';
import { createInvoice, getResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { INVOICES_RESOURCE } from '../../utils/invoices';
import { recordId } from '../../utils/records';
import { todayISO } from '../../utils/residents';
import type { HostelResident } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// The first of the current month, the usual start of a billing period.
function monthStart(): string {
  return `${todayISO().slice(0, 8)}01`;
}

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(INVOICES_RESOURCE);
  const [resident, setResident] = useState<HostelResident | null>(null);
  const [form, setForm] = useState({ fee_plan_id: '', billing_period_start: monthStart(), due_date: '', remarks: '' });
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
      setError('Select the resident to bill.');
      return;
    }
    if (form.due_date < form.billing_period_start) {
      setError('The due date can’t be before the start of the billing period.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const invoice = await createInvoice({ ...form, resident_id: String(resident.resident_id) });
      toast.success('Invoice created');
      const id = recordId(invoice, 'invoice_id');
      navigate(id ? `/hostel/invoices/${id}` : '/hostel/invoices');
    } catch (err) {
      // e.g. the resident may already be invoiced for that period
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create invoice'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
        <p className="text-slate-600 mt-1">Bill a resident for a fee plan</p>
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
                  <label htmlFor="fee_plan_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Fee Plan *
                  </label>
                  <FeePlanSelect
                    id="fee_plan_id"
                    value={form.fee_plan_id}
                    onChange={(fee_plan_id) => setForm({ ...form, fee_plan_id })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="billing_period_start" className="block text-sm font-medium text-slate-700 mb-1">
                    Billing Period Starts *
                  </label>
                  <input
                    id="billing_period_start"
                    type="date"
                    value={form.billing_period_start}
                    onChange={(e) => setForm({ ...form, billing_period_start: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    value={form.due_date}
                    min={form.billing_period_start || undefined}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    rows={2}
                    placeholder="Optional note"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/invoices')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
