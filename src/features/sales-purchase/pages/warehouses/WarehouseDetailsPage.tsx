import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building, Calendar, MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getWarehouse } from '../../api/sales-purchase.api';
import type { Warehouse } from '../../types/sales-purchase.types';

export default function WarehouseDetailsPage() {
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadWarehouse(id);
    }
  }, [id]);

  async function loadWarehouse(warehouseId: string) {
    try {
      setLoading(true);
      const data = await getWarehouse(warehouseId);
      setWarehouse(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load warehouse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/warehouses">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Details</h1>
          <p className="text-slate-600 mt-1">View warehouse information</p>
        </div>
        <Link to={`/sales-purchase/warehouses/${id}/edit`}>
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
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
      ) : warehouse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Warehouse Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Warehouse Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{warehouse.name}</p>
                    {warehouse.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Address</label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{warehouse.address}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Default</label>
                  <p className="mt-1 text-slate-900">{warehouse.isDefault ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Warehouse ID</label>
                  <p className="mt-1 text-slate-900">{warehouse.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
