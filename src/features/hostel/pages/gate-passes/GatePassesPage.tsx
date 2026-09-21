import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ScanLine } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getGatePassView, getGatePasses, type GatePassView } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { recordId } from '../../utils/records';
import type { GenericRecord, RecordLoader } from '../../types/hostel.types';

type View = 'all' | GatePassView;

const VIEWS: { key: View; label: string; empty: string }[] = [
  { key: 'today', label: 'Today', empty: 'No gate passes for today' },
  { key: 'pending', label: 'Pending Approval', empty: 'No passes waiting for approval' },
  { key: 'out', label: 'Currently Out', empty: 'No residents are currently out' },
  { key: 'overdue', label: 'Overdue', empty: 'No overdue passes' },
  { key: 'all', label: 'All Passes', empty: 'No gate passes found' },
];

// Defined once so panels get a stable loader and only refetch on tab change.
const LOADERS: Record<View, RecordLoader> = {
  all: getGatePasses,
  today: (params) => getGatePassView('today', params),
  pending: (params) => getGatePassView('pending', params),
  out: (params) => getGatePassView('out', params),
  overdue: (params) => getGatePassView('overdue', params),
};

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'gate_pass_id', 'pass_id');
  return id ? `/hostel/gate-passes/${id}` : undefined;
};

export default function GatePassesPage() {
  const { can } = useResourceAccess('gate_passes');
  const [view, setView] = useState<View>('today');
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gate Passes</h1>
          <p className="text-slate-600 mt-1">Outing and leave passes, and who is currently outside the hostel</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can('scan') && (
            <Link to="/hostel/gate-passes/scan">
              <Button variant="secondary">
                <ScanLine className="h-4 w-4 mr-2" />
                Gate Scan
              </Button>
            </Link>
          )}
          {can('create') && (
            <Link to="/hostel/gate-passes/new">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                New Gate Pass
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                view === v.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <RecordPanel key={view} load={LOADERS[view]} emptyMessage={current.empty} rowHref={rowHref} />
      </Card>
    </div>
  );
}
