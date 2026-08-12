import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';
import { mockPurchaseOrders } from '../../mock/purchase.mock';

export default function EditPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const po = mockPurchaseOrders.find((p) => p.poId === id);

  const handleSubmit = (data: any) => {
    console.log('Updating purchase order:', id, data);
    // Handle form submission
  };

  if (!po) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/purchase-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Order Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sales-purchase/purchase-orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Purchase Order</h1>
          <p className="text-slate-600 mt-1">Update purchase order {po.poNumber}</p>
        </div>
      </div>

      <PurchaseOrderForm />
    </div>
  );
}
