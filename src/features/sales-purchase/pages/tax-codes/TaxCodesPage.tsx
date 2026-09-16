import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import TaxCodeTable from '../../components/tax-codes/TaxCodeTable';
import { getTaxCodes, deleteTaxCode, setTaxCodeActive } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TaxCode } from '../../types/sales-purchase.types';

export default function TaxCodesPage() {
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTaxCodes();
  }, []);

  async function loadTaxCodes() {
    try {
      setLoading(true);
      const data = await getTaxCodes();
      setTaxCodes(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load tax codes'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tax code?')) {
      return;
    }
    try {
      await deleteTaxCode(id);
      setTaxCodes(taxCodes.filter((t) => t.tax_code_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete tax code'));
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const updated = await setTaxCodeActive(id, isActive);
      setTaxCodes(taxCodes.map((t) => (t.tax_code_id === id ? updated : t)));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to update tax code status'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tax Codes</h1>
          <p className="text-slate-600 mt-1">Manage tax codes and rates</p>
        </div>
        <Link to="/sales-purchase/tax-codes/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Code
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <TaxCodeTable taxCodes={taxCodes} onDelete={handleDelete} onToggleActive={handleToggleActive} />
          )}
        </div>
      </Card>
    </div>
  );
}
