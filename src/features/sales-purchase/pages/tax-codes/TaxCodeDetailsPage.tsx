import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Percent, Calendar, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getTaxCode, deleteTaxCode, setTaxCodeActive } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { TaxCode } from '../../types/sales-purchase.types';

export default function TaxCodeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taxCode, setTaxCode] = useState<TaxCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

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
      setError(getApiErrorMessage(err, 'Failed to load tax code'));
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async () => {
    if (!taxCode) return;
    try {
      setUpdating(true);
      const updated = await setTaxCodeActive(taxCode.tax_code_id, !taxCode.is_active);
      setTaxCode(updated);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to update tax code status'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!taxCode) return;
    if (!window.confirm('Are you sure you want to delete this tax code?')) {
      return;
    }
    try {
      await deleteTaxCode(taxCode.tax_code_id);
      navigate('/sales-purchase/tax-codes');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete tax code'));
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Tax Code Details</h1>
          <p className="text-slate-600 mt-1">View tax code information</p>
        </div>
        {taxCode && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleToggleActive} disabled={updating}>
              {taxCode.is_active ? (
                <PowerOff className="h-4 w-4 mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              {taxCode.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Delete
            </Button>
          </div>
        )}
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
                  <p className="mt-1 text-slate-900">{taxCode.cgst_pct}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">SGST %</label>
                  <p className="mt-1 text-slate-900">{taxCode.sgst_pct}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">IGST %</label>
                  <p className="mt-1 text-slate-900">{taxCode.igst_pct}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Effective From</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{new Date(taxCode.effective_from).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        taxCode.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {taxCode.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Tax Code ID</label>
                  <p className="mt-1 text-slate-900">{taxCode.tax_code_id}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
