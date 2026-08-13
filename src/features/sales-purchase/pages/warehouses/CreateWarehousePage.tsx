import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import WarehouseForm from '../../components/warehouses/WarehouseForm';
import { createWarehouse } from '../../api/sales-purchase.api';
import type { WarehouseFormData } from '../../types/sales-purchase.types';

export default function CreateWarehousePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: WarehouseFormData) => {
    try {
      setIsSubmitting(true);
      await createWarehouse(data);
      navigate('/sales-purchase/warehouses');
    } catch (error: any) {
      console.error('Failed to create warehouse:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/warehouses">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Warehouse</h1>
          <p className="text-slate-600 mt-1">Create a new warehouse location</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <WarehouseForm onSubmit={handleSubmit} submitText="Create Warehouse" isSubmitting={isSubmitting} />
        </div>
      </Card>
    </div>
  );
}
