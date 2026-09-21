import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import { ActiveBadge } from '../../components/blocks/BlockBadges';
import { deleteFeePlan, getFeePlans } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { FEE_PLANS_RESOURCE, cycleLabel } from '../../utils/feePlans';
import { formatCurrency } from '../../utils/format';
import type { FeePlan } from '../../types/hostel.types';

const PAGE_LIMIT = 200;

// A stable empty list, so the memoised filters below don't recompute every render.
const NO_PLANS: FeePlan[] = [];

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

interface Loaded {
  key: number;
  plans: FeePlan[];
  truncated: boolean;
  error?: string;
}

export default function FeePlansPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(FEE_PLANS_RESOURCE);
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [search, setSearch] = useState('');
  const [roomType, setRoomType] = useState('');
  const [cycle, setCycle] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    getFeePlans({ limit: PAGE_LIMIT })
      .then((result) => {
        if (cancelled) return;
        const truncated = !!result.pagination && result.pagination.total > result.data.length;
        setLoaded({ key: reloadKey, plans: result.data, truncated });
      })
      .catch((err) => {
        if (cancelled || isAuthError(err)) return;
        setLoaded({ key: reloadKey, plans: [], truncated: false, error: getApiErrorMessage(err, 'Failed to load fee plans') });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const plans = loaded?.key === reloadKey ? loaded.plans : NO_PLANS;

  const roomTypes = useMemo(() => [...new Set(plans.map((plan) => plan.room_type).filter(Boolean))], [plans]);
  const cycles = useMemo(() => [...new Set(plans.map((plan) => plan.billing_cycle).filter(Boolean))], [plans]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return plans.filter((plan) => {
      if (roomType && plan.room_type !== roomType) return false;
      if (cycle && plan.billing_cycle !== cycle) return false;
      if (status && String(plan.is_active) !== status) return false;
      return !query || plan.name.toLowerCase().includes(query);
    });
  }, [plans, search, roomType, cycle, status]);

  const handleDelete = useCallback(
    async (plan: FeePlan) => {
      if (!window.confirm(`Delete fee plan "${plan.name}"?`)) return;
      try {
        await deleteFeePlan(plan.fee_plan_id);
        toast.success('Fee plan deleted');
        setReloadKey((key) => key + 1);
      } catch (err) {
        // e.g. a plan that already has invoices can't be deleted
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete fee plan'));
      }
    },
    [toast]
  );

  const showActions = can('update') || can('delete');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Plans</h1>
          <p className="text-slate-600 mt-1">What each kind of hostel room costs, and how often it is billed</p>
        </div>
        {can('create') && (
          <Link to="/hostel/fee-plans/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Plan
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by plan name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className={`${inputClass} capitalize`}>
            <option value="">All room types</option>
            {roomTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={cycle} onChange={(e) => setCycle(e.target.value)} className={`${inputClass} capitalize`}>
            <option value="">All cycles</option>
            {cycles.map((option) => (
              <option key={option} value={option}>
                {cycleLabel(option)}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {!loaded || loaded.key !== reloadKey ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : loaded.error ? (
          <div className="p-8 text-center text-red-500">{loaded.error}</div>
        ) : (
          <>
            {loaded.truncated && (
              <p className="px-4 py-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-200">
                Showing the first {loaded.plans.length} fee plans only.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Room Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Mess</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Billed</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    {showActions && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={showActions ? 7 : 6} className="text-center py-8 text-slate-500">
                        No fee plans found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((plan) => (
                      <tr key={plan.fee_plan_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{plan.name}</p>
                          {plan.description && (
                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{plan.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{plan.room_type}</td>
                        <td className="py-3 px-4">
                          <Badge variant={plan.includes_mess ? 'info' : 'neutral'}>
                            {plan.includes_mess ? 'Included' : 'Not included'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(plan.amount)}</td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{cycleLabel(plan.billing_cycle)}</td>
                        <td className="py-3 px-4">
                          <ActiveBadge active={plan.is_active !== false} />
                        </td>
                        {showActions && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {can('update') && (
                                <Link to={`/hostel/fee-plans/${plan.fee_plan_id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {can('delete') && (
                                <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(plan)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
