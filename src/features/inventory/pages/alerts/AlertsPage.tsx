import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, Package, User, MapPin } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { getLowStockAlerts, getOverdueReturnAlerts } from '../../api/alerts.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryLowStockAlert } from '../../types/alert.types';
import type { InventoryIssue } from '../../types/issue.types';

function daysOverdue(dueDate: string): number {
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState<InventoryLowStockAlert[]>([]);
  const [overdue, setOverdue] = useState<InventoryIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [lowStockData, overdueData] = await Promise.all([getLowStockAlerts(), getOverdueReturnAlerts()]);
      setLowStock(lowStockData);
      setOverdue(overdueData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load alerts'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="text-slate-600 mt-1">Items below reorder level and issues overdue for return</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low Stock
              {lowStock.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {lowStock.length}
                </span>
              )}
            </h2>

            {lowStock.length === 0 ? (
              <Card className="border-slate-200">
                <EmptyState
                  icon={Package}
                  title="No low-stock items"
                  description="All active items are above their reorder level."
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {lowStock.map((alert) => (
                  <Link key={alert.item_id} to={`/inventory/items/${alert.item_id}`}>
                    <Card className="border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">
                                {alert.name}
                                <span className="text-slate-500 font-normal"> — {alert.item_code}</span>
                              </p>
                              <p className="text-sm text-slate-600 mt-0.5">{alert.category}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium text-amber-700">
                              {alert.total_stock} / {alert.reorder_level} {alert.unit_of_measure}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">total stock / reorder level</p>
                          </div>
                        </div>
                        {alert.by_location.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap gap-2">
                            {alert.by_location.map((loc) => (
                              <span
                                key={loc.location_id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white text-xs text-slate-600 border border-amber-200"
                              >
                                <MapPin className="h-3 w-3 text-slate-400" />
                                {loc.location}: {loc.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              Overdue Returns
              {overdue.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {overdue.length}
                </span>
              )}
            </h2>

            {overdue.length === 0 ? (
              <Card className="border-slate-200">
                <EmptyState
                  icon={Clock}
                  title="No overdue returns"
                  description="All active issues are within their expected return date."
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {overdue.map((issue) => (
                  <Link key={issue.issue_id} to={`/inventory/issues/${issue.issue_id}`}>
                    <Card className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900">
                              {issue.item?.name ?? `Item #${issue.item_id}`}
                              {issue.asset_unit && <span className="text-slate-500 font-normal font-mono"> — {issue.asset_unit.asset_tag}</span>}
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                              <User className="h-3.5 w-3.5" />
                              {issue.holder?.name ?? `Holder #${issue.holder_id}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-red-700 flex items-center gap-1 justify-end">
                            <Clock className="h-3.5 w-3.5" />
                            {issue.expected_return_date ? daysOverdue(issue.expected_return_date) : 0} day(s) overdue
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {issue.quantity_returned}/{issue.quantity} returned
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
