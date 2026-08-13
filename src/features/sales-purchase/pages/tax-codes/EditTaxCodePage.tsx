import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import TaxCodeForm from '../../components/tax-codes/TaxCodeForm';
import { getTaxCode, updateTaxCode } from '../../api/sales-purchase.api';
import type { TaxCodeFormData } from '../../types/sales-purchase.types';

export default function EditTaxCodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<TaxCodeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(taxCodeId: string) {
    try {
      setLoading(true);
      const data = await getTaxCode(taxCodeId);
      setDefaultValues({
        name: data.name,
        cgstPct: data.cgstPct,
        sgstPct: data.sgstPct,
        igstPct: data.igstPct,
        effectiveFrom: data.effectiveFrom,
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

  const handleSubmit = async (data: TaxCodeFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateTaxCode(id, data);
      navigate('/sales-purchase/tax-codes');
    } catch (error: any) {
      console.error('Failed to update tax code:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update tax code');
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Tax Code</h1>
          <p className="text-slate-600 mt-1">Update tax code information</p>
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
              <TaxCodeForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Tax Code"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
