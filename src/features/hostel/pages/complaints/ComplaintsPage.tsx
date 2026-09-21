import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getComplaints } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { COMPLAINTS_RESOURCE, COMPLAINT_STATUS_FILTERS, PRIORITIES } from '../../utils/complaints';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/hostel.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'complaint_id');
  return id ? `/hostel/complaints/${id}` : undefined;
};

export default function ComplaintsPage() {
  const { can } = useResourceAccess(COMPLAINTS_RESOURCE);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const load = useCallback((params: ListParams) => getComplaints({ ...params, status, priority }), [status, priority]);
  const label = COMPLAINT_STATUS_FILTERS.find((filter) => filter.value === status)?.label.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaints & Maintenance</h1>
          <p className="text-slate-600 mt-1">Repairs and issues raised by residents, and who is fixing them</p>
        </div>
        {can('create') && (
          <Link to="/hostel/complaints/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Raise Complaint
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {COMPLAINT_STATUS_FILTERS.map((filter) => (
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

        <div className="p-4 border-b border-slate-200">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Priority"
            className="px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <RecordPanel
          key={`${status}-${priority}`}
          load={load}
          emptyMessage={status ? `No ${label} complaints` : 'No complaints found'}
          rowHref={rowHref}
        />
      </Card>
    </div>
  );
}
