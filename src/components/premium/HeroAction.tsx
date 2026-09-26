import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Glass pill link for PageHero quick actions; `primary` is solid white.
export default function HeroAction({ to, icon: Icon, label, primary = false }: { to: string; icon: LucideIcon; label: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
        primary ? 'bg-white text-brand-navy shadow-md hover:bg-sky-50' : 'bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/20'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
