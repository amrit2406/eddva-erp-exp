import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getMenuItems } from '../../api/canteen.api';
import { WEEK_DAYS, clockTime } from '../../utils/labels';

export interface ScheduleFormValues {
  itemId: string;
  // Full day names ("MONDAY"). Several on create, exactly one on edit.
  days: string[];
  startTime: string;
  endTime: string;
}

const PRESETS = [
  { label: 'Breakfast', start: '07:30', end: '10:30' },
  { label: 'Lunch', start: '12:00', end: '15:00' },
  { label: 'Evening snacks', start: '16:00', end: '18:30' },
];

interface ScheduleFormProps {
  defaultValues?: ScheduleFormValues;
  // Editing one existing slot: item is fixed and only one day can be picked.
  single?: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function ScheduleForm({ defaultValues, single = false, onSubmit, submitText, isSubmitting }: ScheduleFormProps) {
  const { data: items = [] } = useQuery({ queryKey: ['canteen', 'menu-items'], queryFn: () => getMenuItems() });
  const [itemId, setItemId] = useState(defaultValues?.itemId ?? '');
  const [days, setDays] = useState<string[]>(defaultValues?.days ?? []);
  const [startTime, setStartTime] = useState(defaultValues?.startTime ?? '');
  const [endTime, setEndTime] = useState(defaultValues?.endTime ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    itemId: !itemId ? 'Choose an item' : undefined,
    days: days.length === 0 ? (single ? 'Pick a day' : 'Pick at least one day') : undefined,
    startTime: !startTime ? 'Enter a start time' : undefined,
    endTime: !endTime ? 'Enter an end time' : startTime && endTime <= startTime ? 'Must be after the start time' : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);

  const pickDay = (full: string) => {
    if (single) setDays([full]);
    else setDays((current) => (current.includes(full) ? current.filter((d) => d !== full) : [...current, full]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    onSubmit({ itemId, days: WEEK_DAYS.map((d) => d.full).filter((d) => days.includes(d)), startTime, endTime });
  };

  const item = items.find((i) => i.id === itemId);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="max-w-2xl space-y-5">
          <Field label="Menu item" error={show(errors.itemId)}>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} disabled={single} className={inputClass}>
              <option value="">Choose an item</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">{single ? 'Day' : 'Days'}</span>
              {!single && (
                <span className="flex gap-3 text-xs font-medium">
                  <button type="button" onClick={() => setDays(WEEK_DAYS.slice(0, 5).map((d) => d.full))} className="text-brand hover:text-brand-navy">
                    Weekdays
                  </button>
                  <button type="button" onClick={() => setDays(WEEK_DAYS.map((d) => d.full))} className="text-brand hover:text-brand-navy">
                    Every day
                  </button>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((d) => {
                const on = days.includes(d.full);
                return (
                  <button
                    key={d.full}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pickDay(d.full)}
                    className={`w-14 rounded-xl py-2 text-sm font-medium ring-1 transition ${on ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {show(errors.days) && <p className="mt-1 text-xs text-red-600">{errors.days}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Time</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setStartTime(p.start);
                    setEndTime(p.end);
                  }}
                  className="rounded-lg bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From" error={show(errors.startTime)}>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Until" error={endTime && startTime && endTime <= startTime ? errors.endTime : show(errors.endTime)}>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          {item && days.length > 0 && startTime && endTime > startTime && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{item.name}</span> can be ordered{' '}
              {days.length === 7 ? 'every day' : `on ${days.length} day${days.length === 1 ? '' : 's'}`} from {clockTime(startTime)} to {clockTime(endTime)}.
            </p>
          )}
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
