import { AlertTriangle, CalendarRange, RefreshCw, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface HeroBannerProps {
  attentionCount: number;
  financialYear?: string;
  visitorsOnCampus?: number;
  updatedAt: number;
  refreshing: boolean;
  onRefresh: () => void;
}

// Brand gradient header: who's looking, what day it is, and three things worth knowing.
export default function HeroBanner({ attentionCount, financialYear, visitorsOnCampus, updatedAt, refreshing, onRefresh }: HeroBannerProps) {
  const user = useAuthStore((state) => state.user);
  const now = new Date();
  const firstName = user?.name?.split(' ')[0];

  const highlights = [
    {
      icon: AlertTriangle,
      label: attentionCount === 0 ? 'All clear' : `${attentionCount} item${attentionCount === 1 ? '' : 's'} need attention`,
    },
    financialYear && { icon: CalendarRange, label: `FY ${financialYear}` },
    visitorsOnCampus !== undefined && { icon: UserCheck, label: `${visitorsOnCampus} visitor${visitorsOnCampus === 1 ? '' : 's'} on campus` },
  ].filter((h): h is { icon: typeof AlertTriangle; label: string } => !!h);

  return (
    <div className="animate-rise relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-[#0a4a9c] to-brand p-6 sm:p-8 text-white shadow-lift">
      {/* Decorative light — soft glows plus a faint dot grid. */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand/40 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.9) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          maskImage: 'linear-gradient(to left, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to left, black, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-100/80">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            {greeting(now.getHours())}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-1.5 text-sm text-sky-100/90">Here's where the institution stands across every module.</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {highlights.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-sky-200" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
          {updatedAt > 0 && (
            <p className="text-xs text-sky-100/70">
              Updated {new Date(updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
