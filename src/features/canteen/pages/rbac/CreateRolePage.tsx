import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPermissions, createRole } from '../../api/canteen.api';
import type { Permission } from '../../types/canteen.types';

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        name: formData.name,
        description: formData.description,
        permissionIds: selectedPermissions
      };
      console.log('Creating role with payload:', payload);
      const result = await createRole(payload);
      console.log('Role created successfully:', result);
      navigate('/canteen/roles');
    } catch (err: any) {
      console.error('Failed to create role:', err);
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId];
      console.log('Toggled permission ID:', permissionId, 'Selected:', newPermissions);
      return newPermissions;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
          <p className="text-slate-600 mt-1">Create a new role with permissions</p>
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
        <p className="text-slate-600 mt-1">Create a new role with permissions</p>
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
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Permissions</h3>
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-700">{perm.name}</div>
                        <div className="text-xs text-slate-500">{perm.key}</div>
                        <div className="text-xs text-slate-500">{perm.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/canteen/roles')}
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
