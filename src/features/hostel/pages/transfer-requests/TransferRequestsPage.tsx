import { useCallback, useState } from 'react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getTransferRequests } from '../../api/hostel.api';
import { cn } from '../../../../utils/cn';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/hostel.types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'transfer_request_id', 'request_id');
  return id ? `/hostel/transfer-requests/${id}` : undefined;
};

export default function TransferRequestsPage() {
  const [status, setStatus] = useState('pending');

  const load = useCallback((params: ListParams) => getTransferRequests({ ...params, status }), [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transfer Requests</h1>
        <p className="text-slate-600 mt-1">
          Room change requests from residents. Requests are raised from a resident's page.
        </p>
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                status === filter.value
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <RecordPanel
          key={status}
          load={load}
          emptyMessage={status ? `No ${status} transfer requests` : 'No transfer requests found'}
          rowHref={rowHref}
        />
      </Card>
    </div>
  );
}
