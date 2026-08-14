import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesInvoiceTable from '../../components/sales-invoices/SalesInvoiceTable';
import { getSalesInvoices, deleteSalesInvoice } from '../../api/sales-purchase.api';
import type { SalesInvoice } from '../../types/sales-purchase.types';

export default function SalesInvoicesPage() {
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSalesInvoices();
  }, []);

  async function loadSalesInvoices() {
    try {
      setLoading(true);
      const data = await getSalesInvoices();
      setSalesInvoices(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load sales invoices');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sales invoice?')) {
      return;
    }
    try {
      await deleteSalesInvoice(id);
      setSalesInvoices(salesInvoices.filter((si) => si.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete sales invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Invoices</h1>
          <p className="text-slate-600 mt-1">Manage your sales invoices</p>
        </div>
        <Link to="/sales-purchase/sales-invoices/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Invoice
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
      ) : (
        <Card className="border-slate-200">
          <SalesInvoiceTable salesInvoices={salesInvoices} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
