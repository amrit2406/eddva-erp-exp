import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import InvoiceTable from '../../components/invoices/InvoiceTable';
import { getInvoices, deleteInvoice } from '../../api/sales-purchase.api';
import type { Invoice } from '../../types/sales-purchase.types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    try {
      await deleteInvoice(id);
      setInvoices(invoices.filter((inv) => inv.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Manage your invoices</p>
        </div>
        <Link to="/sales-purchase/invoices/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
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
          <InvoiceTable invoices={invoices} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
