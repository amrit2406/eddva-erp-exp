import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../hooks/useToast';
import { updateMenuItemAvailability } from '../../api/canteen.api';
import type { MenuItem } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

// One-click on/off for an item, with the word next to it so it's clear what it means.
export default function AvailabilitySwitch({ item, showLabel = true }: { item: MenuItem; showLabel?: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const toggle = useMutation({
    mutationFn: (isAvailable: boolean) => updateMenuItemAvailability(item.id, { isAvailable }),
    onSuccess: (_, isAvailable) => {
      queryClient.setQueryData<MenuItem[]>(['canteen', 'menu-items'], (current) => current?.map((i) => (i.id === item.id ? { ...i, isAvailable } : i)));
      queryClient.setQueryData<MenuItem>(['canteen', 'menu-item', item.id], (current) => (current ? { ...current, isAvailable } : current));
      toast.success(isAvailable ? `“${item.name}” is back on the menu` : `“${item.name}” taken off the menu`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not change availability')),
  });
  const on = item.isAvailable;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? `Take ${item.name} off the menu` : `Put ${item.name} back on the menu`}
      title={on ? 'Click to take it off the menu' : 'Click to put it back on the menu'}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate(!on)}
      className="inline-flex items-center gap-2 rounded-full disabled:cursor-wait disabled:opacity-60"
    >
      <span className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      {showLabel && <span className={`text-xs font-medium ${on ? 'text-emerald-700' : 'text-slate-500'}`}>{on ? 'Available' : 'Off menu'}</span>}
    </button>
  );
}
