import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import UOMTable from '../../components/uom/UOMTable';
import { getUOMs } from '../../api/sales-purchase.api';
import type { UOM } from '../../types/sales-purchase.types';

export default function UOMPage() {
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUOMs();
  }, []);

  async function loadUOMs() {
    try {
      setLoading(true);
      const data = await getUOMs();
      setUOMs(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load UOMs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Units of Measure</h1>
          <p className="text-slate-600 mt-1">Manage measurement units for inventory</p>
        </div>
        <Link to="/sales-purchase/uom/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add UOM
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
            <UOMTable uoms={uoms} />
          )}
        </div>
      </Card>
    </div>
  );
}
