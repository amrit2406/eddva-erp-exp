import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PurchaseOrderTable from '../../components/purchase-orders/PurchaseOrderTable';
import PurchaseOrderFilters from '../../components/purchase-orders/PurchaseOrderFilters';

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-600 mt-1">Manage purchase orders and approvals</p>
        </div>
        <Link to="/sales-purchase/purchase-orders/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <PurchaseOrderFilters />
          <div className="mt-4">
            <PurchaseOrderTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
