import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import VendorTable from '../../components/vendors/VendorTable';
import { getVendors } from '../../api/vendors.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryVendor } from '../../types/vendor.types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<InventoryVendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(loadVendors, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function loadVendors() {
    try {
      setLoading(true);
      const data = await getVendors(search || undefined);
      setVendors(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load vendors'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-1">Manage inventory vendors and suppliers</p>
        </div>
        <Link to="/inventory/vendors/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name or email..."
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <VendorTable vendors={vendors} />
        )}
      </Card>
    </div>
  );
}
