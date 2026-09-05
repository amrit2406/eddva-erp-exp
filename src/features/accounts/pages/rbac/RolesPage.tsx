import { Link } from 'react-router-dom';
import { Plus, Shield, Lock, Trash2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getRoles, deleteRole } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountsRole } from '../../types/role.types';

function countPermissions(role: AccountsRole): number {
  return role.permissions.reduce((sum, p) => sum + p.actions.length, 0);
}

export default function RolesPage() {
  const [roles, setRoles] = useState<AccountsRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load roles'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    try {
      await deleteRole(id);
      setRoles(roles.filter((r) => r.role_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete role'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
          <p className="text-slate-600 mt-1">Manage accounts roles and permissions</p>
        </div>
        <Link to="/accounts/roles/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Permissions</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Users</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No roles found
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.role_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{role.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{role.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{countPermissions(role)} permissions</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{role._count?.user_roles ?? 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/accounts/roles/${role.role_id}/edit`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(role.role_id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
