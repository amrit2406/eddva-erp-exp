import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesReceiptTable from '../../components/sales-receipts/SalesReceiptTable';
import { getSalesReceipts, deleteSalesReceipt } from '../../api/sales-purchase.api';
import type { SalesReceipt } from '../../types/sales-purchase.types';

export default function SalesReceiptsPage() {
  const [salesReceipts, setSalesReceipts] = useState<SalesReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSalesReceipts();
  }, []);

  async function loadSalesReceipts() {
    try {
      setLoading(true);
      const data = await getSalesReceipts();
      setSalesReceipts(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load sales receipts');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sales receipt?')) {
      return;
    }
    try {
      await deleteSalesReceipt(id);
      setSalesReceipts(salesReceipts.filter((sr) => sr.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete sales receipt');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Receipts</h1>
          <p className="text-slate-600 mt-1">Manage your sales receipts</p>
        </div>
        <Link to="/sales-purchase/sales-receipts/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Receipt
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
          <SalesReceiptTable salesReceipts={salesReceipts} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
