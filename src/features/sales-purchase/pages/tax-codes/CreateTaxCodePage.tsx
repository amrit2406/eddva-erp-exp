import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import TaxCodeForm from '../../components/tax-codes/TaxCodeForm';
import { createTaxCode } from '../../api/sales-purchase.api';
import type { TaxCodeFormData } from '../../types/sales-purchase.types';

export default function CreateTaxCodePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TaxCodeFormData) => {
    try {
      setIsSubmitting(true);
      await createTaxCode(data);
      navigate('/sales-purchase/tax-codes');
    } catch (error: any) {
      console.error('Failed to create tax code:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create tax code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/tax-codes">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Tax Code</h1>
          <p className="text-slate-600 mt-1">Create a new tax code</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <TaxCodeForm onSubmit={handleSubmit} submitText="Create Tax Code" isSubmitting={isSubmitting} />
        </div>
      </Card>
    </div>
  );
}
