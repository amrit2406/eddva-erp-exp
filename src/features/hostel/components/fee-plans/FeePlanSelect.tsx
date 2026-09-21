import { useEffect, useState } from 'react';
import { getFeePlans } from '../../api/hostel.api';
import { formatCurrency } from '../../utils/format';
import { cycleLabel } from '../../utils/feePlans';
import type { FeePlan } from '../../types/hostel.types';

interface FeePlanSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const PAGE_LIMIT = 200;

// Picks from the active fee plans. If the list can't be read (a role without fee
// plan access), it falls back to typing the plan id.
export default function FeePlanSelect({ id, value, onChange, required }: FeePlanSelectProps) {
  const [plans, setPlans] = useState<FeePlan[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFeePlans({ limit: PAGE_LIMIT })
      .then((result) => {
        if (!cancelled) setPlans(result.data.filter((plan) => plan.is_active !== false));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Fee plan ID"
        className={inputClass}
        required={required}
      />
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!plans}
      className={inputClass}
      required={required}
    >
      <option value="">{plans ? 'Select a fee plan' : 'Loading...'}</option>
      {plans?.map((plan) => (
        <option key={plan.fee_plan_id} value={String(plan.fee_plan_id)}>
          {plan.name} — {formatCurrency(plan.amount)} / {cycleLabel(plan.billing_cycle)}
        </option>
      ))}
    </select>
  );
}
