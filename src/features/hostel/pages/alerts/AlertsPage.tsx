import { useState } from 'react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getAlerts, type AlertView } from '../../api/hostel.api';
import { cn } from '../../../../utils/cn';
import { recordId, relatedId } from '../../utils/records';
import type { GenericRecord, RecordLoader } from '../../types/hostel.types';

const VIEWS: { key: AlertView; label: string; empty: string }[] = [
  { key: 'summary', label: 'Summary', empty: 'No alerts to summarise' },
  { key: 'overdue-passes', label: 'Overdue Passes', empty: 'No gate passes are overdue' },
  { key: 'unaccounted-absences', label: 'Unaccounted Absences', empty: 'No unaccounted absences' },
];

// Defined once so panels get a stable loader and only refetch on tab change.
const LOADERS: Record<AlertView, RecordLoader> = {
  summary: (params) => getAlerts('summary', params),
  'overdue-passes': (params) => getAlerts('overdue-passes', params),
  'unaccounted-absences': (params) => getAlerts('unaccounted-absences', params),
};

const passHref = (row: GenericRecord) => {
  const id = recordId(row, 'gate_pass_id', 'pass_id');
  return id ? `/hostel/gate-passes/${id}` : undefined;
};

const residentHref = (row: GenericRecord) => {
  const id = relatedId(row, 'resident', 'resident_id');
  return id ? `/hostel/residents/${id}` : undefined;
};

const HREFS: Partial<Record<AlertView, (row: GenericRecord) => string | undefined>> = {
  'overdue-passes': passHref,
  'unaccounted-absences': residentHref,
};

export default function AlertsPage() {
  const [view, setView] = useState<AlertView>('summary');
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="text-slate-600 mt-1">Things that need attention: late returns and absences nobody has explained</p>
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

        <RecordPanel key={view} load={LOADERS[view]} emptyMessage={current.empty} rowHref={HREFS[view]} />
      </Card>
    </div>
  );
}
