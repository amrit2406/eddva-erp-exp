import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import RecordPanel from '../../components/common/RecordPanel';
import { getDonations } from '../../api/donations.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'donation_id');
  return id ? `/alumni/donations/${id}` : undefined;
};

export default function DonationsPage() {
  const { can, ready } = useResourceAccess('donations');
  const load = useCallback((params: ListParams) => getDonations(params), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Donations</h1>
          <p className="text-slate-600 mt-1">Donations and their receipts across every campaign</p>
        </div>
        {can('create') && (
          <Link to="/alumni/donations/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Record Donation
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <RecordPanel load={load} emptyMessage="No donations found" rowHref={rowHref} />
      </Card>
    </div>
  );
}
