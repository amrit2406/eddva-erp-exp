import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';
import { createPurchaseOrder } from '../../api/sales-purchase.api';
import type { PurchaseOrderFormData } from '../../types/sales-purchase.types';

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PurchaseOrderFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting purchase order data:', data);
      await createPurchaseOrder(data);
      navigate('/sales-purchase/purchase-orders');
    } catch (error: any) {
      console.error('Failed to create purchase order:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(errorMessage || 'Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/purchase-orders">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Purchase Order</h1>
          <p className="text-slate-600 mt-1">Create a new purchase order</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <PurchaseOrderForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Purchase Order"
          />
        </div>
      </Card>
    </div>
  );
}
