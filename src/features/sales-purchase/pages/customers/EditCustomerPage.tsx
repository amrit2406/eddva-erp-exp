import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CustomerForm from '../../components/customers/CustomerForm';
import { getCustomer, updateCustomer } from '../../api/sales-purchase.api';
import type { CustomerFormData } from '../../types/sales-purchase.types';

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<CustomerFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(customerId: string) {
    try {
      setLoading(true);
      const data = await getCustomer(customerId);
      setDefaultValues({
        customerName: data.customerName,
        gstin: data.gstin,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        paymentTermId: data.paymentTermId,
        creditLimit: data.creditLimit,
        status: data.status,
        contacts: data.contacts,
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

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateCustomer(id, data);
      navigate('/sales-purchase/customers');
    } catch (error: any) {
      console.error('Failed to update customer:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/customers">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Customer</h1>
          <p className="text-slate-600 mt-1">Update customer information</p>
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
              <CustomerForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Customer"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
