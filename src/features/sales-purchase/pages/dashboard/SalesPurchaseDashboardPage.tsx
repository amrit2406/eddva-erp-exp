import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../utils/errors';
import {
  ShoppingCart,
  ShoppingBag,
  Building2,
  Users,
  Package,
  IndianRupee,
  AlertTriangle,
  Clock,
  FileText,
} from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { getDashboardSummary } from '../../api/sales-purchase.api';
import { cn } from '../../../../utils/cn';
import type { DashboardSummary, DashboardStatusCount } from '../../types/sales-purchase.types';

function poStatusBadgeClass(status: string): string {
  switch (status) {
    case 'APPROVED':
    case 'CLOSED':
      return 'bg-green-100 text-green-800';
    case 'PENDING_APPROVAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'PARTIALLY_RECEIVED':
      return 'bg-blue-100 text-blue-800';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function soStatusBadgeClass(status: string): string {
  switch (status) {
    case 'CONFIRMED':
    case 'CLOSED':
      return 'bg-green-100 text-green-800';
    case 'PARTIALLY_INVOICED':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconClass?: string;
}) {
  return (
    <Card className="border-slate-200">
      <div className="p-4">
        <div className="flex items-center gap-2 text-slate-600 mb-1">
          <Icon className={cn('h-4 w-4', iconClass)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </div>
    </Card>
  );
}

function StatusBreakdown({ items, badgeClass }: { items: DashboardStatusCount[]; badgeClass: (s: string) => string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No records.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s.status}
          className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', badgeClass(s.status))}
        >
          {s.status.replace(/_/g, ' ')}
          <span className="bg-white/60 rounded-full px-1.5">{s.count}</span>
        </span>
      ))}
    </div>
  );
}

export default function SalesPurchaseDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sales & Purchase Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of purchase and sales activity</p>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : summary ? (
        <>
          {/* Top-level counts */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={Building2} label="Vendors" value={summary.vendor_count} />
            <StatCard icon={Users} label="Customers" value={summary.customer_count} />
            <StatCard icon={Package} label="Active Items" value={summary.active_item_count} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Purchase</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={FileText}
                  label="Open POs"
                  value={summary.purchase.purchase_orders.open_count}
                />
                <StatCard
                  icon={Clock}
                  label="Pending Approval"
                  value={summary.purchase.purchase_orders.pending_approval_count}
                />
                <StatCard icon={Package} label="GRNs Posted" value={summary.purchase.grns.posted_count} />
                <StatCard icon={Package} label="GRNs Draft" value={summary.purchase.grns.draft_count} />
              </div>

              <Card className="border-slate-200">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Purchase Orders by Status</h3>
                  <StatusBreakdown items={summary.purchase.purchase_orders.by_status} badgeClass={poStatusBadgeClass} />
                </div>
              </Card>

              <Card className="border-slate-200">
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Purchase Invoices (Period)</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Invoices</div>
                      <div className="font-semibold text-slate-900">{summary.purchase.invoices.period_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" /> Grand Total
                      </div>
                      <div className="font-semibold text-slate-900">
                        {summary.purchase.invoices.period_grand_total.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Subtotal</div>
                      <div className="text-slate-900">{summary.purchase.invoices.period_subtotal.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Tax</div>
                      <div className="text-slate-900">{summary.purchase.invoices.period_tax.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" /> Outstanding
                      </div>
                      <div className="font-semibold text-yellow-700">
                        {summary.purchase.invoices.outstanding_count} · {summary.purchase.invoices.outstanding_amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" /> Overdue
                      </div>
                      <div className="font-semibold text-red-700">
                        {summary.purchase.invoices.overdue_count} · {summary.purchase.invoices.overdue_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-slate-200">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Vendors</h3>
                  {summary.purchase.top_vendors.length === 0 ? (
                    <p className="text-sm text-slate-500">No data.</p>
                  ) : (
                    <div className="space-y-2">
                      {summary.purchase.top_vendors.map((v) => (
                        <Link
                          key={v.vendor_id}
                          to={`/sales-purchase/vendors/${v.vendor_id}`}
                          className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2"
                        >
                          <div>
                            <div className="text-slate-900 font-medium">{v.vendor_name}</div>
                            <div className="text-slate-500 text-xs">{v.vendor_code}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-900 font-semibold">{v.total_amount.toLocaleString()}</div>
                            <div className="text-slate-500 text-xs">{v.invoice_count} invoices</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sales Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Sales</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={FileText} label="Open SOs" value={summary.sales.sales_orders.open_count} />
                <StatCard
                  icon={FileText}
                  label="Sales Invoices"
                  value={summary.sales.invoices.period_count}
                />
              </div>

              <Card className="border-slate-200">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Sales Orders by Status</h3>
                  <StatusBreakdown items={summary.sales.sales_orders.by_status} badgeClass={soStatusBadgeClass} />
                </div>
              </Card>

              <Card className="border-slate-200">
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Sales Invoices (Period)</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Invoices</div>
                      <div className="font-semibold text-slate-900">{summary.sales.invoices.period_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" /> Grand Total
                      </div>
                      <div className="font-semibold text-slate-900">
                        {summary.sales.invoices.period_grand_total.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Subtotal</div>
                      <div className="text-slate-900">{summary.sales.invoices.period_subtotal.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Tax</div>
                      <div className="text-slate-900">{summary.sales.invoices.period_tax.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" /> Outstanding
                      </div>
                      <div className="font-semibold text-yellow-700">
                        {summary.sales.invoices.outstanding_count} · {summary.sales.invoices.outstanding_amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" /> Overdue
                      </div>
                      <div className="font-semibold text-red-700">
                        {summary.sales.invoices.overdue_count} · {summary.sales.invoices.overdue_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-slate-200">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Customers</h3>
                  {summary.sales.top_customers.length === 0 ? (
                    <p className="text-sm text-slate-500">No data.</p>
                  ) : (
                    <div className="space-y-2">
                      {summary.sales.top_customers.map((c) => (
                        <Link
                          key={c.customer_id}
                          to={`/sales-purchase/customers/${c.customer_id}`}
                          className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2"
                        >
                          <div>
                            <div className="text-slate-900 font-medium">{c.customer_name}</div>
                            <div className="text-slate-500 text-xs">{c.customer_code}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-900 font-semibold">{c.total_amount.toLocaleString()}</div>
                            <div className="text-slate-500 text-xs">{c.invoice_count} invoices</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
