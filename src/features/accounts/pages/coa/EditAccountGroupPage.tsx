import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getAccountGroup, updateAccountGroup, getAccountGroups } from '../../api/coa.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountGroup, AccountGroupFormData } from '../../types/coa.types';

export default function EditAccountGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [formData, setFormData] = useState<AccountGroupFormData>({
    groupName: '',
    parentGroupId: undefined,
    nature: 'ASSET',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [groupData, allGroups] = await Promise.all([getAccountGroup(id), getAccountGroups()]);
      setFormData({
        groupName: groupData.groupName,
        parentGroupId: groupData.parentGroupId ?? undefined,
        nature: groupData.nature as AccountGroupFormData['nature'],
      });
      setGroups(allGroups.filter((g) => g.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load account group'));
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
      await updateAccountGroup(id, formData);
      navigate('/accounts/coa/groups');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update account group'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Account Group</h1>
          <p className="text-slate-600 mt-1">Update account group details</p>
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Account Group</h1>
        <p className="text-slate-600 mt-1">Update account group details</p>
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
              <label htmlFor="groupName" className="block text-sm font-medium text-slate-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                id="groupName"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nature" className="block text-sm font-medium text-slate-700 mb-1">
                  Nature *
                </label>
                <Select
                  id="nature"
                  value={formData.nature}
                  onChange={(e) => setFormData({ ...formData, nature: e.target.value as AccountGroupFormData['nature'] })}
                  options={[
                    { value: 'ASSET', label: 'Asset' },
                    { value: 'LIABILITY', label: 'Liability' },
                    { value: 'INCOME', label: 'Income' },
                    { value: 'EXPENSE', label: 'Expense' },
                    { value: 'EQUITY', label: 'Equity' },
                  ]}
                  required
                />
              </div>

              <div>
                <label htmlFor="parentGroupId" className="block text-sm font-medium text-slate-700 mb-1">
                  Parent Group
                </label>
                <Select
                  id="parentGroupId"
                  value={formData.parentGroupId ?? ''}
                  onChange={(e) => setFormData({ ...formData, parentGroupId: e.target.value || undefined })}
                  placeholder="None (top-level group)"
                  options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/accounts/coa/groups')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Group'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
