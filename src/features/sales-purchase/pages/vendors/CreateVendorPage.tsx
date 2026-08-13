import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VendorForm from '../../components/vendors/VendorForm';
import { createVendor } from '../../api/sales-purchase.api';
import type { VendorFormData } from '../../types/sales-purchase.types';

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: VendorFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting vendor data:', data);
      await createVendor(data);
      navigate('/sales-purchase/vendors');
    } catch (error: any) {
      console.error('Failed to create vendor:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(errorMessage || 'Failed to create vendor');
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
          <h1 className="text-2xl font-bold text-slate-900">Add Vendor</h1>
          <p className="text-slate-600 mt-1">Create a new vendor</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VendorForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Vendor"
          />
        </div>
      </Card>
    </div>
  );
}
