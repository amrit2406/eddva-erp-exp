import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CustomerTable from '../../components/customers/CustomerTable';
import { getCustomers } from '../../api/sales-purchase.api';
import type { Customer } from '../../types/sales-purchase.types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage your customer relationships</p>
        </div>
        <Link to="/sales-purchase/customers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
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
          <CustomerTable customers={customers} />
        </Card>
      )}
    </div>
  );
}
