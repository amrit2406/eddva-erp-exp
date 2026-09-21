import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import CheckoutButton from '../../components/visitors/CheckoutButton';
import { getVisitorView, getVisitors, type VisitorView } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { recordId } from '../../utils/records';
import { VISITORS_RESOURCE } from '../../utils/visitors';
import type { GenericRecord, RecordLoader } from '../../types/hostel.types';

type View = 'all' | VisitorView;

const VIEWS: { key: View; label: string; empty: string }[] = [
  { key: 'active', label: 'Currently Inside', empty: 'No visitors are inside the hostel right now' },
  { key: 'today', label: 'Today', empty: 'No visitors today' },
  { key: 'all', label: 'All Visitors', empty: 'No visitors recorded yet' },
];

// Defined once so panels get a stable loader and only refetch on tab change.
const LOADERS: Record<View, RecordLoader> = {
  all: getVisitors,
  active: (params) => getVisitorView('active', params),
  today: (params) => getVisitorView('today', params),
};

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'visitor_id');
  return id ? `/hostel/visitors/${id}` : undefined;
};

export default function VisitorsPage() {
  const { can } = useResourceAccess(VISITORS_RESOURCE);
  const [view, setView] = useState<View>('active');
  // Bumped after a checkout so the visible list refetches.
  const [reloadKey, setReloadKey] = useState(0);
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];
  const canCheckout = can('checkout') || can('update');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitors</h1>
          <p className="text-slate-600 mt-1">Who has come to see a resident, and who is still inside</p>
        </div>
        {can('create') && (
          <Link to="/hostel/visitors/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Record Visitor
            </Button>
          </Link>
        )}
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

        <RecordPanel
          key={`${view}-${reloadKey}`}
          load={LOADERS[view]}
          emptyMessage={current.empty}
          rowHref={rowHref}
          rowActions={
            canCheckout
              ? (row) => <CheckoutButton visitor={row} onDone={() => setReloadKey((key) => key + 1)} />
              : undefined
          }
        />
      </Card>
    </div>
  );
}
