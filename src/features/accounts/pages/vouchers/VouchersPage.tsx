import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VoucherTable from '../../components/vouchers/VoucherTable';
import { getVouchers } from '../../api/vouchers.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { Voucher } from '../../types/voucher.types';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    try {
      setLoading(true);
      const data = await getVouchers();
      setVouchers(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load vouchers'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vouchers</h1>
          <p className="text-slate-600 mt-1">Manage accounting vouchers and journal entries</p>
        </div>
        <Link to="/accounts/vouchers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Voucher
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
          <VoucherTable vouchers={vouchers} />
        </Card>
      )}
    </div>
  );
}
