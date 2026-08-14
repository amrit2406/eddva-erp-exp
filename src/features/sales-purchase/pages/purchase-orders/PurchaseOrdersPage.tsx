import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PurchaseOrderTable from '../../components/purchase-orders/PurchaseOrderTable';
import { getPurchaseOrders, deletePurchaseOrder } from '../../api/sales-purchase.api';
import type { PurchaseOrder } from '../../types/sales-purchase.types';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  async function loadPurchaseOrders() {
    try {
      setLoading(true);
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) {
      return;
    }
    try {
      await deletePurchaseOrder(id);
      setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete purchase order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-600 mt-1">Manage your purchase orders</p>
        </div>
        <Link to="/sales-purchase/purchase-orders/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase Order
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
          <PurchaseOrderTable purchaseOrders={purchaseOrders} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
