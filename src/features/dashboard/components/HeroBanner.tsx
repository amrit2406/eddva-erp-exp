import { AlertTriangle, CalendarRange, UserCheck } from 'lucide-react';
import PageHero, { type HeroHighlight } from '../../../components/premium/PageHero';
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

// Main dashboard hero: greets the user and surfaces three things worth knowing.
export default function HeroBanner({ attentionCount, financialYear, visitorsOnCampus, updatedAt, refreshing, onRefresh }: HeroBannerProps) {
  const user = useAuthStore((state) => state.user);
  const now = new Date();
  const firstName = user?.name?.split(' ')[0];

  const highlights: HeroHighlight[] = [
    {
      icon: AlertTriangle,
      label: attentionCount === 0 ? 'All clear' : `${attentionCount} item${attentionCount === 1 ? '' : 's'} need attention`,
    },
  ];
  if (financialYear) highlights.push({ icon: CalendarRange, label: `FY ${financialYear}` });
  if (visitorsOnCampus !== undefined) {
    highlights.push({ icon: UserCheck, label: `${visitorsOnCampus} visitor${visitorsOnCampus === 1 ? '' : 's'} on campus` });
  }

  return (
    <PageHero
      eyebrow={now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      title={`${greeting(now.getHours())}${firstName ? `, ${firstName}` : ''}`}
      subtitle="Here's where the institution stands across every module."
      highlights={highlights}
      updatedAt={updatedAt}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
