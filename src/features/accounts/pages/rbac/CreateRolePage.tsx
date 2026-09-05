import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ResourcePermissionsToggle from '../../components/rbac/ResourcePermissionsToggle';
import { getPermissionsCatalog, createRole } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountsPermissionResourceGroup, AccountsRolePermissionRule } from '../../types/role.types';

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<AccountsPermissionResourceGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<AccountsRolePermissionRule[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      setLoading(true);
      const catalog = await getPermissionsCatalog();
      setResources(catalog.resources);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load permissions catalog'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPermissions.length === 0) {
      setError('Select at least one permission for this role.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createRole({
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: selectedPermissions,
      });
      navigate('/accounts/roles');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create role'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
          <p className="text-slate-600 mt-1">Create a new accounts role with permissions</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading permissions...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
        <p className="text-slate-600 mt-1">Create a new accounts role with permissions</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  placeholder="e.g. Accounts Clerk"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  placeholder="e.g. Creates draft vouchers and views reports; cannot post or close the year"
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Permissions</h3>
              <ResourcePermissionsToggle
                resources={resources}
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/accounts/roles')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
