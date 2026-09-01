import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PermissionTable from '../../components/rbac/PermissionTable';
import { getPermissions, deletePermission } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryPermissionEntry } from '../../types/role.types';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<InventoryPermissionEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
      setError(getApiErrorMessage(err, 'Failed to load permissions'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) {
      return;
    }
    try {
      await deletePermission(id);
      setPermissions(permissions.filter((p) => p.permission_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete permission'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
          <p className="text-slate-600 mt-1">Manage inventory permissions registry</p>
        </div>
        <Link to="/inventory/permissions/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
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
          <PermissionTable permissions={permissions} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
