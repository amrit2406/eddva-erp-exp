import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { getApplicationActivity, getApplicationStatusHistory } from '../../api/admission.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDateTime, formatLabel } from '../../utils/format';
import { cn } from '../../../../utils/cn';
import type { ApplicationActivity, ApplicationStatusChange } from '../../types/admission.types';

type Tab = 'history' | 'activity';

interface ApplicationHistoryPanelProps {
  applicationId: number;
  // Changes when the application changes, so both lists refetch.
  refreshKey: string;
}

function StatusChangeRow({ change }: { change: ApplicationStatusChange }) {
  const to = change.to_status ?? change.status;
  const by = change.changed_by ?? change.created_by;
  return (
    <li className="border-l-2 border-slate-200 pl-4">
      <div className="flex flex-wrap items-center gap-2">
        {change.from_status && (
          <>
            <ApplicationStatusBadge status={change.from_status} />
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </>
        )}
        {to && <ApplicationStatusBadge status={to} />}
      </div>
      {change.reason && <p className="mt-1 text-slate-700 whitespace-pre-wrap break-words">{change.reason}</p>}
      <p className="mt-1 text-xs text-slate-500">
        {formatDateTime(change.created_at)}
        {by ? ` · by ${by}` : ''}
      </p>
    </li>
  );
}

function ActivityRow({ activity }: { activity: ApplicationActivity }) {
  const title = activity.action ?? activity.type;
  const description = activity.description ?? activity.message;
  const by = activity.performed_by ?? activity.created_by;
  return (
    <li className="border-l-2 border-slate-200 pl-4">
      {title && <div className="text-sm font-medium text-slate-900 capitalize">{formatLabel(title)}</div>}
      {description && <p className="mt-0.5 text-slate-700 whitespace-pre-wrap break-words">{description}</p>}
      <p className="mt-1 text-xs text-slate-500">
        {formatDateTime(activity.created_at)}
        {by ? ` · by ${by}` : ''}
      </p>
    </li>
  );
}

function TimelineList({ applicationId, tab }: { applicationId: number; tab: Tab }) {
  const [items, setItems] = useState<Array<ApplicationStatusChange | ApplicationActivity> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const request = tab === 'history' ? getApplicationStatusHistory(applicationId) : getApplicationActivity(applicationId);
    request
      .then((data) => {
        if (cancelled) return;
        // Newest first, regardless of the order the API returns.
        setItems([...data].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load this list'));
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, tab]);

  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  if (!items) return <div className="text-center text-slate-500 py-4">Loading...</div>;
  if (items.length === 0) {
    return (
      <div className="text-center text-slate-500 py-4">
        {tab === 'history' ? 'No status changes recorded yet' : 'No activity recorded yet'}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item, index) =>
        tab === 'history' ? (
          <StatusChangeRow key={index} change={item as ApplicationStatusChange} />
        ) : (
          <ActivityRow key={index} activity={item as ApplicationActivity} />
        )
      )}
    </ul>
  );
}

export default function ApplicationHistoryPanel({ applicationId, refreshKey }: ApplicationHistoryPanelProps) {
  const [tab, setTab] = useState<Tab>('history');

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex gap-1 border-b border-slate-200" role="tablist">
          {([
            ['history', 'Status History'],
            ['activity', 'Activity'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                'px-3 pb-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === value
                  ? 'border-[#008BE9] text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <TimelineList key={`${tab}|${refreshKey}`} applicationId={applicationId} tab={tab} />
      </div>
    </Card>
  );
}
