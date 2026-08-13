import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import UOMForm from '../../components/uom/UOMForm';
import { createUOM } from '../../api/sales-purchase.api';
import type { UOMFormData } from '../../types/sales-purchase.types';

export default function CreateUOMPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UOMFormData) => {
    try {
      setIsSubmitting(true);
      await createUOM(data);
      navigate('/sales-purchase/uom');
    } catch (error: any) {
      console.error('Failed to create UOM:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create UOM');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/uom">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Unit of Measure</h1>
          <p className="text-slate-600 mt-1">Create a new measurement unit</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <UOMForm onSubmit={handleSubmit} submitText="Create UOM" isSubmitting={isSubmitting} />
        </div>
      </Card>
    </div>
  );
}
