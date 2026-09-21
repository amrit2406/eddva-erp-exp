import { useEffect, useState } from 'react';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../common/GenericDataView';
import { getDashboardSection, type DashboardSectionKey } from '../../api/hostel.api';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { RecordResult } from '../../types/hostel.types';

interface DashboardSectionProps {
  title: string;
  section: DashboardSectionKey;
  // Changes when the dashboard is refreshed.
  refreshKey: number;
}

interface Loaded {
  key: number;
  result?: RecordResult;
  error?: string;
}

// Each section loads on its own, so one endpoint failing doesn't blank the dashboard.
export default function DashboardSection({ title, section, refreshKey }: DashboardSectionProps) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardSection(section)
      .then((result) => {
        if (!cancelled) setLoaded({ key: refreshKey, result });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoaded({ key: refreshKey, error: isAuthError(err) ? 'You can’t view this section.' : getApiErrorMessage(err, 'Failed to load') });
      });
    return () => {
      cancelled = true;
    };
  }, [section, refreshKey]);

  // While a refresh is in flight the previous numbers stay, dimmed.
  const stale = loaded !== null && loaded.key !== refreshKey;

  return (
    <Card className="border-slate-200">
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {!loaded ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : loaded.error ? (
        <div className="p-8 text-center text-red-500">{loaded.error}</div>
      ) : (
        <div className={stale ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <GenericDataView data={loaded.result?.data ?? {}} emptyMessage="Nothing to show yet" />
        </div>
      )}
    </Card>
  );
}
