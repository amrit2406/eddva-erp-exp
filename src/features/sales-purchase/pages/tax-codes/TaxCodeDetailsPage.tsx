import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Percent, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getTaxCode } from '../../api/sales-purchase.api';
import type { TaxCode } from '../../types/sales-purchase.types';

export default function TaxCodeDetailsPage() {
  const { id } = useParams();
  const [taxCode, setTaxCode] = useState<TaxCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTaxCode(id);
    }
  }, [id]);

  async function loadTaxCode(taxCodeId: string) {
    try {
      setLoading(true);
      const data = await getTaxCode(taxCodeId);
      setTaxCode(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load tax code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/tax-codes">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Tax Code Details</h1>
          <p className="text-slate-600 mt-1">View tax code information</p>
        </div>
        <Link to={`/sales-purchase/tax-codes/${id}/edit`}>
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : taxCode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tax Code Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Tax Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{taxCode.name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">CGST %</label>
                  <p className="mt-1 text-slate-900">{taxCode.cgstPct}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">SGST %</label>
                  <p className="mt-1 text-slate-900">{taxCode.sgstPct}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">IGST %</label>
                  <p className="mt-1 text-slate-900">{taxCode.igstPct}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Effective From</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{new Date(taxCode.effectiveFrom).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Tax Code ID</label>
                  <p className="mt-1 text-slate-900">{taxCode.id}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
