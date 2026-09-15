import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VendorForm from '../../components/vendors/VendorForm';
import { getVendor, updateVendor, getPaymentTerms } from '../../api/sales-purchase.api';
import type { VendorFormData, PaymentTerm } from '../../types/sales-purchase.types';

export default function EditVendorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<VendorFormData | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(vendorId: string) {
    try {
      setLoading(true);
      const [data] = await Promise.all([
        getVendor(vendorId),
        getPaymentTerms()
          .then(setPaymentTerms)
          .catch((err) => {
            if (err.response?.status !== 401) {
              console.error('Failed to load payment terms:', err);
            }
          }),
      ]);
      setDefaultValues({
        vendor_name: data.vendor_name,
        gstin: data.gstin || undefined,
        tax_id: data.tax_id || undefined,
        address_line1: data.address_line1 || undefined,
        address_line2: data.address_line2 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        pincode: data.pincode || undefined,
        payment_term_id: data.payment_term_id || undefined,
        credit_limit: data.credit_limit ? Number(data.credit_limit) : undefined,
        status: data.status,
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

  const handleSubmit = async (data: VendorFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateVendor(id, data);
      navigate('/sales-purchase/vendors');
    } catch (error: any) {
      console.error('Failed to update vendor:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/vendors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Vendor</h1>
          <p className="text-slate-600 mt-1">Update vendor information</p>
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
              <VendorForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Vendor"
                paymentTerms={paymentTerms}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
