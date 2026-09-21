import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import DayMenu from '../../components/mess-menu/DayMenu';
import MenuEntries from '../../components/mess-menu/MenuEntries';
import WeeklyMenu from '../../components/mess-menu/WeeklyMenu';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { MESS_MENU_RESOURCE } from '../../utils/messMenu';

type Tab = 'weekly' | 'day' | 'entries';

const TABS: { key: Tab; label: string }[] = [
  { key: 'weekly', label: 'Weekly Menu' },
  { key: 'day', label: 'By Day' },
  { key: 'entries', label: 'All Entries' },
];

export default function MessMenuPage() {
  const { can, ready } = useResourceAccess(MESS_MENU_RESOURCE);
  // The tab lives in the URL so create/edit can send people back to "All Entries".
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: Tab = TABS.some((t) => t.key === requested) ? (requested as Tab) : 'weekly';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mess Menu</h1>
          <p className="text-slate-600 mt-1">What the hostel mess serves, by day and meal</p>
        </div>
        {can('create') && (
          <Link to="/hostel/mess-menu/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Entry
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setParams({ tab: t.key })}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'weekly' && <WeeklyMenu />}
        {tab === 'day' && <DayMenu />}
        {tab === 'entries' && <MenuEntries canUpdate={can('update')} canDelete={can('delete')} />}
      </Card>
    </div>
  );
}
