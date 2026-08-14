import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';
import { getSalesOrder, updateSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrderFormData } from '../../types/sales-purchase.types';

export default function EditSalesOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<SalesOrderFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(salesOrderId: string) {
    try {
      setLoading(true);
      const data = await getSalesOrder(salesOrderId);
      setDefaultValues({
        customerId: data.customerId,
        soDate: data.soDate,
        deliveryDate: data.deliveryDate,
        discount: data.discount,
        items: data.items,
      });
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: SalesOrderFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateSalesOrder(id, data);
      navigate('/sales-purchase/sales-orders');
    } catch (error: any) {
      console.error('Failed to update sales order:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update sales order');
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Sales Order</h1>
          <p className="text-slate-600 mt-1">Update sales order information</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="p-6">
            {defaultValues && (
              <SalesOrderForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Sales Order"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
