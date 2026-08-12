import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';

export default function CreateSalesOrderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sales-purchase/sales-orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Sales Order</h1>
          <p className="text-slate-600 mt-1">Create a new sales order</p>
        </div>
      </div>

      <SalesOrderForm />
    </div>
  );
}
