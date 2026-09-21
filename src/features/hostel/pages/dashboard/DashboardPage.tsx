import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import DashboardSection from '../../components/dashboard/DashboardSection';
import type { DashboardSectionKey } from '../../api/hostel.api';

const SECTIONS: { key: DashboardSectionKey; title: string }[] = [
  { key: 'occupancy', title: 'Occupancy' },
  { key: 'gate-status', title: 'Gate Status' },
  { key: 'attendance', title: 'Attendance' },
  { key: 'complaints', title: 'Complaints' },
  { key: 'fees', title: 'Fees' },
  { key: 'mess', title: 'Mess' },
];

export default function DashboardPage() {
  // Bumping the key refetches every section.
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hostel Dashboard</h1>
          <p className="text-slate-600 mt-1">Where the hostel stands right now</p>
        </div>
        <Button variant="secondary" onClick={() => setRefreshKey((key) => key + 1)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DashboardSection title="Overview" section="summary" refreshKey={refreshKey} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <DashboardSection key={section.key} title={section.title} section={section.key} refreshKey={refreshKey} />
        ))}
      </div>
    </div>
  );
}
