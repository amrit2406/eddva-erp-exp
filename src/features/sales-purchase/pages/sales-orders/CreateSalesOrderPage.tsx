import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';
import { createSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrderFormData } from '../../types/sales-purchase.types';

export default function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SalesOrderFormData) => {
    try {
      setIsSubmitting(true);
      await createSalesOrder(data);
      navigate('/sales-purchase/sales-orders');
    } catch (error: any) {
      console.error('Failed to create sales order:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create sales order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/sales-orders">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Sales Order</h1>
          <p className="text-slate-600 mt-1">Create a new sales order</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <SalesOrderForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Sales Order"
          />
        </div>
      </Card>
    </div>
  );
}
