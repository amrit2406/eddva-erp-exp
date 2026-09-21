import Badge from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';

const GENDER_STYLES: Record<string, string> = {
  boys: 'bg-blue-100 text-blue-800',
  girls: 'bg-pink-100 text-pink-800',
};

export function GenderBadge({ gender }: { gender: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        GENDER_STYLES[gender.toLowerCase()] ?? 'bg-gray-100 text-gray-800'
      )}
    >
      {gender}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</Badge>;
}
