import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';
import { mockSalesOrders } from '../../mock/sales.mock';

export default function EditSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const so = mockSalesOrders.find((s) => s.soId === id);

  const handleSubmit = (data: any) => {
    console.log('Updating sales order:', id, data);
    // Handle form submission
  };

  if (!so) {
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
            <h1 className="text-2xl font-bold text-slate-900">Sales Order Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Sales Order</h1>
          <p className="text-slate-600 mt-1">Update sales order {so.soNumber}</p>
        </div>
      </div>

      <SalesOrderForm />
    </div>
  );
}
