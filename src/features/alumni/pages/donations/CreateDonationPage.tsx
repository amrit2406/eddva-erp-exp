import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import AlumniPicker from '../../components/profiles/AlumniPicker';
import { getCampaigns } from '../../api/campaigns.api';
import { createDonation } from '../../api/donations.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { recordId } from '../../utils/records';
import type { AlumniProfile } from '../../types/profile.types';
import type { Campaign, DonationFormData } from '../../types/fundraising.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

const PAYMENT_MODES = ['upi', 'card', 'netbanking', 'cash', 'cheque', 'bank_transfer'];

export default function CreateDonationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('donations');
  const presetCampaignId = searchParams.get('campaign_id') ?? '';
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [form, setForm] = useState<Omit<DonationFormData, 'alumni_id'>>({
    campaign_id: presetCampaignId,
    amount: '',
    payment_mode: 'upi',
    transaction_ref: '',
    is_anonymous: false,
    notes: '',
    mark_received: false,
    received_on: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCampaigns({ limit: 200 })
      .then((result) => setCampaigns(result.data))
      .catch(() => setCampaigns([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumni) {
      setError('Select the donor.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const donation = await createDonation({ ...form, alumni_id: String(alumni.profile_id) });
      toast.success('Donation recorded');
      const id = recordId(donation, 'donation_id');
      navigate(id ? `/alumni/donations/${id}` : '/alumni/donations');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to record donation'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Donation</h1>
        <p className="text-slate-600 mt-1">Log a donation against a campaign</p>
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
                  <label htmlFor="donor" className="block text-sm font-medium text-slate-700 mb-1">
                    Donor *
                  </label>
                  <AlumniPicker id="donor" selected={alumni} onSelect={setAlumni} />
                </div>

                <div>
                  <label htmlFor="campaign_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Campaign *
                  </label>
                  <select
                    id="campaign_id"
                    value={form.campaign_id}
                    onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="">Select a campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.campaign_id} value={String(campaign.campaign_id)}>
                        {campaign.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                    Amount *
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="5000"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="payment_mode" className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    id="payment_mode"
                    value={form.payment_mode}
                    onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                    className={inputClass}
                    required
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="transaction_ref" className="block text-sm font-medium text-slate-700 mb-1">
                    Transaction Reference *
                  </label>
                  <input
                    id="transaction_ref"
                    type="text"
                    value={form.transaction_ref}
                    onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
                    placeholder="UPI-991823"
                    className={inputClass}
                    required
                  />
                </div>

                {form.mark_received && (
                  <div>
                    <label htmlFor="received_on" className="block text-sm font-medium text-slate-700 mb-1">
                      Received On
                    </label>
                    <input
                      id="received_on"
                      type="date"
                      value={form.received_on}
                      onChange={(e) => setForm({ ...form, received_on: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Anonymous donation
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.mark_received}
                    onChange={(e) => setForm({ ...form, mark_received: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Payment already received
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/alumni/donations')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting || !alumni}>
                  {submitting ? 'Recording...' : 'Record Donation'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
