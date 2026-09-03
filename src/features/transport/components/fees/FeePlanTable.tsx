import { CreditCard, Route as RouteIcon } from 'lucide-react';
import type { TransportFeePlan } from '../../types/fee.types';
import { cn } from '../../../../utils/cn';

interface FeePlanTableProps {
  plans: TransportFeePlan[];
  className?: string;
}

export default function FeePlanTable({ plans, className }: FeePlanTableProps) {
  const plansArray = Array.isArray(plans) ? plans : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Plan Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Basis</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Route</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Billing Cycle</th>
          </tr>
        </thead>
        <tbody>
          {plansArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No fee plans found. Add your first plan.
              </td>
            </tr>
          ) : (
            plansArray.map((plan) => (
              <tr key={plan.fee_plan_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{plan.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 capitalize">{plan.basis}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {plan.route_id ? (
                    <span className="inline-flex items-center gap-1">
                      <RouteIcon className="h-3.5 w-3.5 text-slate-400" />
                      {plan.route?.name ?? `#${plan.route_id}`}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-900 font-medium">₹{plan.amount}</td>
                <td className="py-3 px-4 text-sm text-slate-600 capitalize">{plan.billing_cycle}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
