import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ClipboardCheck,
  Clock,
  IndianRupee,
  Boxes,
  UserCheck,
  Archive,
  Gauge,
  MapPin,
  Folder,
  Truck,
  BellRing,
} from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import RankedBarList from '../../components/dashboard/RankedBarList';
import { getDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryDashboardSummary } from '../../types/dashboard.types';
import { cn } from '../../../../utils/cn';

const ASSET_STATUS_COLOR: Record<string, string> = {
  in_store: '#22c55e',
  issued: '#008BE9',
  under_repair: '#f59e0b',
  disposed: '#94a3b8',
  lost: '#ef4444',
};

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  viewAllHref?: string;
}

function SectionHeader({ icon: Icon, title, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#008BE9]" />
        {title}
      </h2>
      {viewAllHref && (
        <Link to={viewAllHref} className="text-[#008BE9] hover:text-[#002C6D] text-sm font-medium">
          View All
        </Link>
      )}
    </div>
  );
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function InventoryDashboardPage() {
  const [summary, setSummary] = useState<InventoryDashboardSummary | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardSummary({ from: from || undefined, to: to || undefined });
      setSummary(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!summary) {
    return <div className="text-center py-8 text-slate-500">No dashboard data available.</div>;
  }

  const stockByLocation = summary.stock_by_location.map((l) => ({ label: l.location, count: l.quantity }));
  const categoryConsumption = summary.category_wise_consumption.map((c) => ({ label: c.category, count: c.issue_count }));
  const assetsByStatus = summary.assets.by_status.map((s) => ({
    label: s.status.replace('_', ' '),
    count: s.count,
    color: ASSET_STATUS_COLOR[s.status] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Inventory Overview</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Stock levels, issues, assets, and valuation at a glance</p>
        </div>
        <Link
          to="/inventory/alerts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          <BellRing className="h-4 w-4" />
          View Alerts
        </Link>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <DashboardStatCard label="Total Items" value={summary.total_items} icon={Package} color="blue" />
        <Link to="/inventory/alerts">
          <DashboardStatCard
            label="Low Stock Items"
            value={summary.low_stock_items}
            icon={AlertTriangle}
            color={summary.low_stock_items > 0 ? 'amber' : 'slate'}
            className={cn(summary.low_stock_items > 0 && 'hover:border-amber-200 transition-colors cursor-pointer')}
          />
        </Link>
        <DashboardStatCard label="Today's Issues" value={summary.todays_issues} icon={ClipboardCheck} color="purple" />
        <Link to="/inventory/alerts">
          <DashboardStatCard
            label="Overdue Returns"
            value={summary.overdue_returns}
            icon={Clock}
            color={summary.overdue_returns > 0 ? 'red' : 'slate'}
            className={cn(summary.overdue_returns > 0 && 'hover:border-red-200 transition-colors cursor-pointer')}
          />
        </Link>
        <DashboardStatCard label="Stock Valuation" value={formatCurrency(summary.stock_valuation)} icon={IndianRupee} color="green" />
      </div>

      {/* Stock by Location */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={MapPin} title="Stock by Location" viewAllHref="/inventory/stock/balances" />
          <RankedBarList items={stockByLocation} emptyText="No stock recorded yet." />
        </div>
      </Card>

      {/* Assets */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={Boxes} title="Assets" viewAllHref="/inventory/assets" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <DashboardStatCard label="Total" value={summary.assets.total} icon={Archive} color="blue" />
            <DashboardStatCard label="Issued" value={summary.assets.issued} icon={UserCheck} color="blue" />
            <DashboardStatCard label="Idle" value={summary.assets.idle} icon={Archive} color="slate" />
            <DashboardStatCard label="Utilization" value={`${summary.assets.utilization_pct}%`} icon={Gauge} color="purple" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">By Status</h3>
          <RankedBarList items={assetsByStatus} emptyText="No asset units yet." />
        </div>
      </Card>

      {/* Category-wise Consumption */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={Folder} title="Category-wise Consumption" viewAllHref="/inventory/categories" />
          <RankedBarList items={categoryConsumption} emptyText="No issues recorded yet." />
        </div>
      </Card>

      {/* Vendor-wise Purchases */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={Truck} title="Vendor-wise Purchases" viewAllHref="/inventory/stock/purchases" />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          {summary.vendor_wise_purchases.length === 0 ? (
            <div className="text-sm text-slate-400 py-4 text-center">No purchases in this range.</div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Vendor</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Purchases</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.vendor_wise_purchases.map((v) => (
                    <tr key={v.vendor_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{v.vendor}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{v.purchase_count}</td>
                      <td className="py-2 px-4 text-sm font-medium text-slate-900">{formatCurrency(v.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
