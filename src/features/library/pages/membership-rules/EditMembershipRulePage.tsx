import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMembershipRule, updateMembershipRule } from '../../api/library.api';
import type { MembershipRuleFormData } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function EditMembershipRulePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<MembershipRuleFormData>({
    member_type: '',
    max_books_allowed: 3,
    loan_period_days: 14,
    fine_per_day: 2.5,
    grace_period_days: 2,
    max_fine_cap: 100
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getMembershipRule(id);
      setFormData({
        member_type: data.member_type,
        max_books_allowed: data.max_books_allowed,
        loan_period_days: data.loan_period_days,
        fine_per_day: data.fine_per_day,
        grace_period_days: data.grace_period_days,
        max_fine_cap: data.max_fine_cap
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load membership rule');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMembershipRule(id, formData);
      navigate(ROUTES.LIBRARY_MEMBERSHIP_RULES);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to update membership rule');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Membership Rule</h1>
          <p className="text-slate-600 mt-1">Update membership rule details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Membership Rule</h1>
        <p className="text-slate-600 mt-1">Update membership rule details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="member_type" className="block text-sm font-medium text-slate-700 mb-1">
                Member Type *
              </label>
              <select
                id="member_type"
                value={formData.member_type}
                onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              >
                <option value="">Select member type</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="max_books_allowed" className="block text-sm font-medium text-slate-700 mb-1">
                  Max Books Allowed *
                </label>
                <input
                  type="number"
                  id="max_books_allowed"
                  value={formData.max_books_allowed}
                  onChange={(e) => setFormData({ ...formData, max_books_allowed: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="loan_period_days" className="block text-sm font-medium text-slate-700 mb-1">
                  Loan Period (Days) *
                </label>
                <input
                  type="number"
                  id="loan_period_days"
                  value={formData.loan_period_days}
                  onChange={(e) => setFormData({ ...formData, loan_period_days: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="fine_per_day" className="block text-sm font-medium text-slate-700 mb-1">
                  Fine Per Day *
                </label>
                <input
                  type="number"
                  id="fine_per_day"
                  value={formData.fine_per_day}
                  onChange={(e) => setFormData({ ...formData, fine_per_day: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="grace_period_days" className="block text-sm font-medium text-slate-700 mb-1">
                  Grace Period (Days) *
                </label>
                <input
                  type="number"
                  id="grace_period_days"
                  value={formData.grace_period_days}
                  onChange={(e) => setFormData({ ...formData, grace_period_days: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="max_fine_cap" className="block text-sm font-medium text-slate-700 mb-1">
                  Max Fine Cap *
                </label>
                <input
                  type="number"
                  id="max_fine_cap"
                  value={formData.max_fine_cap}
                  onChange={(e) => setFormData({ ...formData, max_fine_cap: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.LIBRARY_MEMBERSHIP_RULES)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Rule'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}