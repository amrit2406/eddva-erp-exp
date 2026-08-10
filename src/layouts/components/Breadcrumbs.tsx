import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatBreadcrumbName = (name: string) => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link to="/" className="text-slate-500 hover:text-slate-700 transition-colors">
        Home
      </Link>
      {pathnames.length > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center gap-2">
            {isLast ? (
              <span className="font-medium text-slate-900">
                {formatBreadcrumbName(name)}
              </span>
            ) : (
              <>
                <Link to={routeTo} className="text-slate-500 hover:text-slate-700 transition-colors">
                  {formatBreadcrumbName(name)}
                </Link>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
