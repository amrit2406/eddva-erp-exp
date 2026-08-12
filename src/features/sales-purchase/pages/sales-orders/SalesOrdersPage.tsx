import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesOrderTable from '../../components/sales-orders/SalesOrderTable';
import SalesOrderFilters from '../../components/sales-orders/SalesOrderFilters';

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="text-slate-600 mt-1">Manage sales orders and deliveries</p>
        </div>
        <Link to="/sales-purchase/sales-orders/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create SO
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <SalesOrderFilters />
          <div className="mt-4">
            <SalesOrderTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
