import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GRNForm from '../../components/grn/GRNForm';
import { createGRN } from '../../api/sales-purchase.api';
import type { GRNFormData } from '../../types/sales-purchase.types';

export default function CreateGRNPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: GRNFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createGRN(data);
      navigate('/sales-purchase/grn');
    } catch (error: any) {
      console.error('Failed to create GRN:', error);
      if (error.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      setError(errorMessage || 'Failed to create GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/grn">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Goods Received Note</h1>
          <p className="text-slate-600 mt-1">Create a new GRN</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <GRNForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create GRN"
          />
        </div>
      </Card>
    </div>
  );
}
