import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Ruler, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getUOM } from '../../api/sales-purchase.api';
import type { UOM } from '../../types/sales-purchase.types';

export default function UOMDetailsPage() {
  const { id } = useParams();
  const [uom, setUOM] = useState<UOM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUOM(id);
    }
  }, [id]);

  async function loadUOM(uomId: string) {
    try {
      setLoading(true);
      const data = await getUOM(uomId);
      setUOM(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load UOM');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/uom">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">UOM Details</h1>
          <p className="text-slate-600 mt-1">View unit of measure information</p>
        </div>
        <Link to={`/sales-purchase/uom/${id}/edit`}>
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
      ) : uom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">UOM Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">UOM Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{uom.name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Code</label>
                  <p className="mt-1 text-slate-900">{uom.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">UOM ID</label>
                  <p className="mt-1 text-slate-900">{uom.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{uom.createdAt ? new Date(uom.createdAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
