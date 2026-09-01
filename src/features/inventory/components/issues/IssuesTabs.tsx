import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck, Settings } from 'lucide-react';
import { cn } from '../../../../utils/cn';

const TABS = [
  { path: '/inventory/issues', label: 'Issues', icon: ClipboardCheck },
  { path: '/inventory/issues/approval-rules', label: 'Approval Rules', icon: Settings },
];

export default function IssuesTabs() {
  const location = useLocation();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((tab) => {
        const isActive =
          tab.path === '/inventory/issues'
            ? location.pathname === '/inventory/issues' || /^\/inventory\/issues\/(new|\d+)$/.test(location.pathname)
            : location.pathname.startsWith(tab.path);
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
  );
}
