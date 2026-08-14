import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GRNForm from '../../components/grn/GRNForm';
import { getGRN, updateGRN } from '../../api/sales-purchase.api';
import type { GRNFormData } from '../../types/sales-purchase.types';

export default function EditGRNPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<GRNFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(grnId: string) {
    try {
      setLoading(true);
      const data = await getGRN(grnId);
      setDefaultValues({
        purchaseOrderId: data.purchaseOrderId,
        grnDate: data.grnDate,
        warehouseId: data.warehouseId,
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

  const handleSubmit = async (data: GRNFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateGRN(id, data);
      navigate('/sales-purchase/grn');
    } catch (error: any) {
      console.error('Failed to update GRN:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update GRN');
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
          <h1 className="text-2xl font-bold text-slate-900">Edit GRN</h1>
          <p className="text-slate-600 mt-1">Update goods received note information</p>
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
              <GRNForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update GRN"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
