import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GRNTable from '../../components/grn/GRNTable';
import { getGRNs, deleteGRN } from '../../api/sales-purchase.api';
import type { GRN } from '../../types/sales-purchase.types';

export default function GRNsPage() {
  const [grns, setGRNs] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGRNs();
  }, []);

  async function loadGRNs() {
    try {
      setLoading(true);
      const data = await getGRNs();
      setGRNs(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load GRNs');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this GRN?')) {
      return;
    }
    try {
      await deleteGRN(id);
      setGRNs(grns.filter((g) => g.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete GRN');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goods Received Notes</h1>
          <p className="text-slate-600 mt-1">Manage your GRNs</p>
        </div>
        <Link to="/sales-purchase/grn/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add GRN
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
          <GRNTable grns={grns} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
