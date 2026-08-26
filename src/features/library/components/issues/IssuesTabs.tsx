import { Link, useLocation } from 'react-router-dom';
import { BookPlus, ListChecks, AlertTriangle } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import LibrarianIdControl from './LibrarianIdControl';

const TABS = [
  { path: '/library/issues/desk', label: 'Desk', icon: BookPlus },
  { path: '/library/issues', label: 'Active', icon: ListChecks },
  { path: '/library/issues/overdue', label: 'Overdue', icon: AlertTriangle },
];

export default function IssuesTabs() {
  const location = useLocation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <LibrarianIdControl />
    </div>
  );
}
