import { useState, useEffect } from 'react';
import Card from '../../../../components/ui/Card';
import PermissionsCatalogTable from '../../components/rbac/PermissionsCatalogTable';
import { getPermissionsCatalog } from '../../api/library.api';
import type { PermissionResource } from '../../types/library.types';

export default function PermissionsPage() {
  const [resources, setResources] = useState<PermissionResource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      setLoading(true);
      const catalog = await getPermissionsCatalog();
      setResources(catalog.resources);
      setTotal(catalog.total);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load permissions catalog');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
        <p className="text-slate-600 mt-1">
          Library permission catalog — {total} permission{total !== 1 ? 's' : ''} across {resources.length} resource{resources.length !== 1 ? 's' : ''}
        </p>
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
