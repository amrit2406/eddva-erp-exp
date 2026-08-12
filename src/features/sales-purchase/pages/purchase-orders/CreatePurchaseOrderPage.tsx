import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';

export default function CreatePurchaseOrderPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Create Purchase Order</h1>
          <p className="text-slate-600 mt-1">Create a new purchase order</p>
        </div>
      </div>

      <PurchaseOrderForm />
    </div>
  );
}
