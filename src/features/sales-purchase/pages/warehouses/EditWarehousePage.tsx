import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import WarehouseForm from '../../components/warehouses/WarehouseForm';
import { getWarehouse, updateWarehouse } from '../../api/sales-purchase.api';
import type { WarehouseFormData } from '../../types/sales-purchase.types';

export default function EditWarehousePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<WarehouseFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(warehouseId: string) {
    try {
      setLoading(true);
      const data = await getWarehouse(warehouseId);
      setDefaultValues({
        name: data.name,
        address: data.address,
        isDefault: data.isDefault,
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

  const handleSubmit = async (data: WarehouseFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateWarehouse(id, data);
      navigate('/sales-purchase/warehouses');
    } catch (error: any) {
      console.error('Failed to update warehouse:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update warehouse');
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Warehouse</h1>
          <p className="text-slate-600 mt-1">Update warehouse information</p>
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
              <WarehouseForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Warehouse"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
