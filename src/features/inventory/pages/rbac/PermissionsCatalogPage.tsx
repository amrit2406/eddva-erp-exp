import { useState, useEffect } from 'react';
import Card from '../../../../components/ui/Card';
import PermissionsCatalogTable from '../../components/rbac/PermissionsCatalogTable';
import { getPermissionsCatalog } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryPermissionResourceGroup } from '../../types/role.types';

export default function PermissionsCatalogPage() {
  const [resources, setResources] = useState<InventoryPermissionResourceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await getPermissionsCatalog();
      setResources(data.resources);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load permissions'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
        <p className="text-slate-600 mt-1">System-defined inventory permissions registry</p>
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
          <PermissionsCatalogTable resources={resources} />
        </Card>
      )}
    </div>
  );
}
