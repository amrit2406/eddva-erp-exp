import { useEffect, useState } from 'react';
import Card from '../../../../components/ui/Card';
import ReportData from '../../components/reports/ReportData';
import {
  getDashboardCommunication,
  getDashboardDirectory,
  getDashboardDonations,
  getDashboardEvents,
  getDashboardJobs,
  getDashboardMentorship,
  getDashboardSummary,
} from '../../api/dashboard.api';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';

type Tab = 'directory' | 'events' | 'jobs' | 'mentorship' | 'donations' | 'communication';

const TABS: { key: Tab; label: string; load: () => Promise<unknown> }[] = [
  { key: 'directory', label: 'Directory', load: getDashboardDirectory },
  { key: 'events', label: 'Events', load: getDashboardEvents },
  { key: 'jobs', label: 'Jobs', load: getDashboardJobs },
  { key: 'mentorship', label: 'Mentorship', load: getDashboardMentorship },
  { key: 'donations', label: 'Donations', load: getDashboardDonations },
  { key: 'communication', label: 'Communication', load: getDashboardCommunication },
];

interface SectionState {
  key: string;
  data?: unknown;
  error?: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SectionState | null>(null);
  const [tab, setTab] = useState<Tab>('directory');
  const [section, setSection] = useState<SectionState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary({ key: 'summary', data });
      })
      .catch((err) => {
        if (!cancelled) setSummary({ key: 'summary', error: getApiErrorMessage(err, 'Failed to load summary') });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const current = TABS.find((t) => t.key === tab)!;
    let cancelled = false;
    setSection(null);
    current
      .load()
      .then((data) => {
        if (!cancelled) setSection({ key: tab, data });
      })
      .catch((err) => {
        if (!cancelled) setSection({ key: tab, error: getApiErrorMessage(err, `Failed to load ${current.label.toLowerCase()}`) });
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alumni Dashboard</h1>
        <p className="text-slate-600 mt-1">A snapshot of the alumni program</p>
      </div>

      <Card className="border-slate-200">
        <div className="px-6 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
        </div>
        <div className="p-6">
          {!summary ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : summary.error ? (
            <div className="text-center text-red-500 py-4">{summary.error}</div>
          ) : (
            <ReportData data={summary.data} />
          )}
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {!section || section.key !== tab ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : section.error ? (
            <div className="text-center text-red-500 py-8">{section.error}</div>
          ) : (
            <ReportData key={tab} data={section.data} />
          )}
        </div>
      </Card>
    </div>
  );
}
