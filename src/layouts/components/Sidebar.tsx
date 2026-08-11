import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Calendar, IndianRupee, BookOpen, Bus, FileText, Settings, Building } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/ui.store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/front-office', label: 'Front Office', icon: Building },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/teachers', label: 'Teachers', icon: GraduationCap },
  { path: '/attendance', label: 'Attendance', icon: Calendar },
  { path: '/fees', label: 'Fees', icon: IndianRupee },
  { path: '/examinations', label: 'Examinations', icon: FileText },
  { path: '/library', label: 'Library', icon: BookOpen },
  { path: '/transport', label: 'Transport', icon: Bus },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <>
      {/* Mobile overlay - only shows on mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #002C6D 0%, #008BE9 100%)' }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">School ERP</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[#008BE9]/10 text-[#002C6D]'
                          : 'text-slate-700 hover:bg-slate-100'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-[#008BE9]/10 px-2 py-0.5 text-xs text-[#002C6D]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
