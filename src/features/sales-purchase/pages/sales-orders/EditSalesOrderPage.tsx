import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';
import { getSalesOrder, updateSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrderFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

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
        customer_id: data.customer_id,
        so_date: data.so_date,
        delivery_date: data.delivery_date || undefined,
        discount: Number(data.discount) || 0,
        items: (data.items || []).map((item) => ({
          item_id: item.item_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_code_id: item.tax_code_id,
          line_discount: Number(item.line_discount) || 0,
        })),
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
      alert(getApiErrorMessage(error, 'Failed to update sales order'));
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
