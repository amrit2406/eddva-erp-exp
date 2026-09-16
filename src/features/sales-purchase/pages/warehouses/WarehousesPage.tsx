import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import WarehouseTable from '../../components/warehouses/WarehouseTable';
import { getWarehouses, deleteWarehouse } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { Warehouse } from '../../types/sales-purchase.types';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    try {
      setLoading(true);
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load warehouses'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) {
      return;
    }
    try {
      await deleteWarehouse(id);
      setWarehouses(warehouses.filter((w) => w.warehouse_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete warehouse'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
          <p className="text-slate-600 mt-1">Manage warehouse locations</p>
        </div>
        <Link to="/sales-purchase/warehouses/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <WarehouseTable warehouses={warehouses} onDelete={handleDelete} />
          )}
        </div>
      </Card>
    </div>
  );
}
