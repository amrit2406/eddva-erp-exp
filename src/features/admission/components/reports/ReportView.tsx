import { useState } from 'react';
import FunnelBars from './FunnelBars';
import ReportData from './ReportData';
import { cn } from '../../../../utils/cn';
import { toFunnelStages, type ReportKey } from '../../utils/reports';

interface ReportViewProps {
  report: ReportKey;
  data: unknown;
}

// The funnel is drawn as bars when its data looks like stages; everything else
// (and the funnel's own table view) uses the generic renderer.
export default function ReportView({ report, data }: ReportViewProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const stages = report === 'funnel' ? toFunnelStages(data) : null;

  if (!stages) return <ReportData data={data} />;

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50" role="tablist">
        {(['chart', 'table'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={view === option}
            onClick={() => setView(option)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors',
              view === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {view === 'chart' ? <FunnelBars stages={stages} /> : <ReportData data={data} />}
    </div>
  );
}
