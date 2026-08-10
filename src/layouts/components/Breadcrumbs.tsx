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
      <Link to="/" className="text-gray-500 hover:text-gray-700">
        Home
      </Link>
      {pathnames.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center gap-2">
            {isLast ? (
              <span className="font-medium text-gray-900">
                {formatBreadcrumbName(name)}
              </span>
            ) : (
              <>
                <Link to={routeTo} className="text-gray-500 hover:text-gray-700">
                  {formatBreadcrumbName(name)}
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
