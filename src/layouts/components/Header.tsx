import { Menu, Bell, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useUIStore } from '../../stores/ui.store';
import UserMenu from './UserMenu';

export default function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <Button variant="ghost" size="sm" onClick={toggleSidebar}>
          <Menu className="h-5 w-5 text-slate-600" />
        </Button>
        <div className="relative hidden sm:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full max-w-64 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#008BE9] focus:outline-none focus:ring-2 focus:ring-[#008BE9]/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5 text-slate-600" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
