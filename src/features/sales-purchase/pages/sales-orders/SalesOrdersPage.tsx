import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesOrderTable from '../../components/sales-orders/SalesOrderTable';
import { getSalesOrders, deleteSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrder } from '../../types/sales-purchase.types';

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSalesOrders();
  }, []);

  async function loadSalesOrders() {
    try {
      setLoading(true);
      const data = await getSalesOrders();
      setSalesOrders(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sales order?')) {
      return;
    }
    try {
      await deleteSalesOrder(id);
      setSalesOrders(salesOrders.filter((so) => so.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete sales order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="text-slate-600 mt-1">Manage your sales orders</p>
        </div>
        <Link to="/sales-purchase/sales-orders/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Order
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
          <SalesOrderTable salesOrders={salesOrders} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
