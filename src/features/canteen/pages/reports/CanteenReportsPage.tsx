import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2,
  ShoppingBag,
  Tag,
  CreditCard,
  Clock,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import {
  getSalesReport,
  getItemSalesReport,
  getCategorySalesReport,
  getPaymentSummaryReport,
  getShiftsReport,
} from '../../api/canteen.api';
import type {
  SalesReport,
  ItemSalesReport,
  CategorySalesReport,
  PaymentSummaryReport,
  ShiftsReport,
  ReportParams,
} from '../../types/canteen.types';

// ─── Tab config ──────────────────────────────────────────────────────────────

type TabId = 'sales' | 'item-sales' | 'category-sales' | 'payment-summary' | 'shifts';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'sales',            label: 'Sales',            icon: BarChart2   },
  { id: 'item-sales',       label: 'Item Sales',       icon: ShoppingBag },
  { id: 'category-sales',   label: 'Category Sales',   icon: Tag         },
  { id: 'payment-summary',  label: 'Payment Summary',  icon: CreditCard  },
  { id: 'shifts',           label: 'Shifts',           icon: Clock       },
];

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}) {
  const colors = {
    blue:   { bg: 'bg-[#008BE9]/10', text: 'text-[#008BE9]' },
    green:  { bg: 'bg-green-100',    text: 'text-green-600'  },
    amber:  { bg: 'bg-amber-100',    text: 'text-amber-600'  },
    purple: { bg: 'bg-purple-100',   text: 'text-purple-600' },
    red:    { bg: 'bg-red-100',      text: 'text-red-600'    },
  };
  const c = colors[color];
  return (
    <Card className="border-slate-200">
      <div className="p-5 flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium truncate">{label}</p>
          <p className="text-xl font-bold text-slate-900 truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Date filter bar ─────────────────────────────────────────────────────────

function DateFilter({
  startDate,
  endDate,
  onStartDate,
  onEndDate,
  onApply,
  onClear,
  loading,
}: {
  startDate: string;
  endDate: string;
  onStartDate: (v: string) => void;
  onEndDate:   (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
        />
      </div>
      <Button variant="primary" size="sm" onClick={onApply} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Loading…' : 'Apply'}
      </Button>
      {(startDate || endDate) && (
        <Button variant="ghost" size="sm" onClick={onClear} disabled={loading}>
          Clear
        </Button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CanteenReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Report data
  const [salesData,          setSalesData]          = useState<SalesReport | null>(null);
  const [itemSalesData,      setItemSalesData]      = useState<ItemSalesReport | null>(null);
  const [categorySalesData,  setCategorySalesData]  = useState<CategorySalesReport | null>(null);
  const [paymentSummaryData, setPaymentSummaryData] = useState<PaymentSummaryReport | null>(null);
  const [shiftsData,         setShiftsData]         = useState<ShiftsReport | null>(null);

  const params = useCallback((): ReportParams => {
    const p: ReportParams = {};
    if (startDate) p.startDate = startDate;
    if (endDate)   p.endDate   = endDate;
    return p;
  }, [startDate, endDate]);

  const loadReport = useCallback(async (tab: TabId, p: ReportParams) => {
    try {
      setLoading(true);
      setError(null);
      switch (tab) {
        case 'sales':           setSalesData(await getSalesReport(p));           break;
        case 'item-sales':      setItemSalesData(await getItemSalesReport(p));   break;
        case 'category-sales':  setCategorySalesData(await getCategorySalesReport(p)); break;
        case 'payment-summary': setPaymentSummaryData(await getPaymentSummaryReport(p)); break;
        case 'shifts':          setShiftsData(await getShiftsReport(p));         break;
      }
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on tab switch
  useEffect(() => {
    loadReport(activeTab, params());
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => loadReport(activeTab, params());
  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    loadReport(activeTab, {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">Canteen performance insights</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-[#008BE9] text-[#008BE9]'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Date filter */}
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDate={setStartDate}
        onEndDate={setEndDate}
        onApply={handleApply}
        onClear={handleClear}
        loading={loading}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Sales Report ─────────────────────────────────────────────────────── */}
      {activeTab === 'sales' && (
        <>
          {loading && !salesData ? (
            <LoadingCard />
          ) : salesData ? (
            <SalesReportView data={salesData} />
          ) : (
            <EmptyCard />
          )}
        </>
      )}

      {/* ── Item Sales Report ─────────────────────────────────────────────────── */}
      {activeTab === 'item-sales' && (
        <>
          {loading && !itemSalesData ? (
            <LoadingCard />
          ) : itemSalesData ? (
            <ItemSalesReportView data={itemSalesData} />
          ) : (
            <EmptyCard />
          )}
        </>
      )}

      {/* ── Category Sales Report ─────────────────────────────────────────────── */}
      {activeTab === 'category-sales' && (
        <>
          {loading && !categorySalesData ? (
            <LoadingCard />
          ) : categorySalesData ? (
            <CategorySalesReportView data={categorySalesData} />
          ) : (
            <EmptyCard />
          )}
        </>
      )}

      {/* ── Payment Summary Report ────────────────────────────────────────────── */}
      {activeTab === 'payment-summary' && (
        <>
          {loading && !paymentSummaryData ? (
            <LoadingCard />
          ) : paymentSummaryData ? (
            <PaymentSummaryReportView data={paymentSummaryData} />
          ) : (
            <EmptyCard />
          )}
        </>
      )}

      {/* ── Shifts Report ─────────────────────────────────────────────────────── */}
      {activeTab === 'shifts' && (
        <>
          {loading && !shiftsData ? (
            <LoadingCard />
          ) : shiftsData ? (
            <ShiftsReportView data={shiftsData} />
          ) : (
            <EmptyCard />
          )}
        </>
      )}
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function LoadingCard() {
  return (
    <Card className="border-slate-200">
      <div className="p-10 text-center text-slate-500">Loading report…</div>
    </Card>
  );
}

function EmptyCard() {
  return (
    <Card className="border-slate-200">
      <div className="p-10 text-center text-slate-400">No data available</div>
    </Card>
  );
}

// ── Sales ─────────────────────────────────────────────────────────────────────

function SalesReportView({ data }: { data: SalesReport }) {
  const r: any = data;

  // Sales breakdown rows for the channel table
  const salesChannels = [
    { label: 'Cash',   value: r.cashSales   ?? 0, color: 'bg-green-100 text-green-700'  },
    { label: 'Card',   value: r.cardSales   ?? 0, color: 'bg-blue-100 text-blue-700'    },
    { label: 'UPI',    value: r.upiSales    ?? 0, color: 'bg-purple-100 text-purple-700' },
    { label: 'Wallet', value: r.walletSales ?? 0, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards — row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Orders"     value={r.totalOrders     ?? 0}                          icon={Receipt}     color="blue"   />
        <StatCard label="Completed Orders" value={r.completedOrders ?? 0}                          icon={TrendingUp}  color="green"  />
        <StatCard label="Cancelled Orders" value={r.cancelledOrders ?? 0}                          icon={TrendingDown} color="red"   />
        <StatCard label="Gross Sales"      value={`₹${Number(r.grossSales ?? 0).toFixed(2)}`}      icon={IndianRupee} color="amber"  />
      </div>

      {/* KPI cards — row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Discount"  value={`₹${Number(r.discount  ?? 0).toFixed(2)}`}  icon={TrendingDown} color="red"    />
        <StatCard label="Tax"       value={`₹${Number(r.tax       ?? 0).toFixed(2)}`}  icon={IndianRupee}  color="amber"  />
        <StatCard label="Net Sales" value={`₹${Number(r.netSales  ?? 0).toFixed(2)}`}  icon={TrendingUp}   color="green"  />
      </div>

      {/* Sales by channel */}
      <Card className="border-slate-200">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Sales by Payment Channel</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Channel</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Share %</th>
              </tr>
            </thead>
            <tbody>
              {salesChannels.map((ch) => {
                const gross = Number(r.grossSales ?? 0);
                const share = gross > 0 ? (Number(ch.value) / gross) * 100 : 0;
                return (
                  <tr key={ch.label} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ch.color}`}>
                        {ch.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      ₹{Number(ch.value).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-[#008BE9] rounded-full" style={{ width: `${Math.min(share, 100).toFixed(1)}%` }} />
                        </div>
                        <span className="text-xs text-slate-600 w-10 text-right">{share.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-600 uppercase">Gross Total</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Number(r.grossSales ?? 0).toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Summary breakdown */}
      <Card className="border-slate-200">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Sales Summary</h3>
          <dl className="divide-y divide-slate-100">
            {[
              { label: 'Gross Sales',  value: r.grossSales,  cls: 'text-slate-900' },
              { label: 'Discount',     value: -r.discount,   cls: 'text-red-600'   },
              { label: 'Tax',          value: r.tax,         cls: 'text-slate-900' },
              { label: 'Net Sales',    value: r.netSales,    cls: 'text-green-700 font-bold text-base' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex items-center justify-between py-2.5 px-1">
                <dt className="text-sm text-slate-600">{label}</dt>
                <dd className={`text-sm ${cls}`}>
                  {Number(value ?? 0) < 0 ? '-' : ''}₹{Math.abs(Number(value ?? 0)).toFixed(2)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>
    </div>
  );
}

// ── Item Sales ─────────────────────────────────────────────────────────────────

function ItemSalesReportView({ data }: { data: ItemSalesReport }) {
  const items: any[] = Array.isArray(data)
    ? (data as any[])
    : (data as any).items
      ?? (data as any).data
      ?? Object.values(data as any).find((v) => Array.isArray(v))
      ?? [];

  // API fields: categoryName, totalItemsSold, totalSales
  const totalRevenue  = (data as any).totalRevenue  ?? items.reduce((s: number, r: any) => s + Number(r.totalSales    ?? r.revenue     ?? 0), 0);
  const totalQuantity = (data as any).totalQuantity ?? items.reduce((s: number, r: any) => s + Number(r.totalItemsSold ?? r.quantitySold ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Categories" value={items.length}                          icon={ShoppingBag} color="blue"  />
        <StatCard label="Total Items Sold"  value={totalQuantity}                        icon={TrendingUp}  color="green" />
        <StatCard label="Total Sales"       value={`₹${Number(totalRevenue).toFixed(2)}`} icon={IndianRupee} color="amber" />
      </div>

      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Items Sold</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No item sales data</td></tr>
              ) : (
                items.map((row: any, i: number) => (
                  <tr key={row.itemId ?? row.categoryName ?? i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-500">{i + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{row.categoryName ?? row.itemName ?? row.name ?? '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{row.totalItemsSold ?? row.quantitySold ?? 0}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{Number(row.totalSales ?? row.revenue ?? 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              {items.length > 0 && (
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={2} className="py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase">Total</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">{totalQuantity}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{Number(totalRevenue).toFixed(2)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Category Sales ─────────────────────────────────────────────────────────────

function CategorySalesReportView({ data }: { data: CategorySalesReport }) {
  const cats: any[] = Array.isArray(data)
    ? (data as any[])
    : (data as any).categories
      ?? (data as any).data
      ?? Object.values(data as any).find((v) => Array.isArray(v))
      ?? [];

  // API fields: totalItemsSold, totalSales (also handle revenue/quantitySold aliases)
  const totalRevenue = (data as any).totalRevenue
    ?? cats.reduce((s: number, r: any) => s + Number(r.totalSales ?? r.revenue ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Categories"    value={cats.length}                             icon={Tag}         color="purple" />
        <StatCard label="Total Revenue" value={`₹${Number(totalRevenue).toFixed(2)}`}   icon={IndianRupee} color="blue"   />
        <StatCard label="Total Items Sold" value={cats.reduce((s: number, r: any) => s + Number(r.totalItemsSold ?? r.quantitySold ?? 0), 0)} icon={ShoppingBag} color="green" />
      </div>

      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Items Sold</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Sales</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Share %</th>
              </tr>
            </thead>
            <tbody>
              {cats.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No category sales data</td></tr>
              ) : (
                cats.map((row: any, i: number) => {
                  const revenue = Number(row.totalSales ?? row.revenue ?? 0);
                  const share = totalRevenue > 0 ? (revenue / Number(totalRevenue)) * 100 : 0;
                  return (
                    <tr key={row.categoryId ?? i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-500">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{row.categoryName ?? row.name ?? '—'}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{row.totalItemsSold ?? row.quantitySold ?? 0}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-[#008BE9] rounded-full" style={{ width: `${Math.min(share, 100).toFixed(1)}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 w-10 text-right">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              {cats.length > 0 && (
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={3} className="py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase">Total</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{Number(totalRevenue).toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">100%</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Payment Summary ────────────────────────────────────────────────────────────

const paymentModeColors: Record<string, string> = {
  CASH:          'bg-green-100 text-green-700',
  CARD:          'bg-blue-100 text-blue-700',
  UPI:           'bg-purple-100 text-purple-700',
  WALLET:        'bg-orange-100 text-orange-700',
  BANK_TRANSFER: 'bg-sky-100 text-sky-700',
  OTHER:         'bg-slate-100 text-slate-700',
};

function PaymentSummaryReportView({ data }: { data: PaymentSummaryReport }) {
  const payments: any[] = Array.isArray(data)
    ? (data as any[])
    : (data as any).payments
      ?? (data as any).data
      ?? Object.values(data as any).find((v) => Array.isArray(v))
      ?? [];

  const totalAmount       = (data as any).totalAmount       ?? payments.reduce((s: number, r: any) => s + Number(r.totalAmount ?? 0), 0);
  const totalTransactions = (data as any).totalTransactions ?? payments.reduce((s: number, r: any) => s + Number(r.transactionCount ?? r.count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Collected"   value={`₹${Number(totalAmount).toFixed(2)}`} icon={IndianRupee} color="blue"  />
        <StatCard label="Total Transactions" value={totalTransactions}                   icon={Receipt}     color="green" />
        <StatCard label="Payment Modes"      value={payments.length}                     icon={CreditCard}  color="purple"/>
      </div>

      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Mode</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Transactions</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Amount</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Share %</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No payment data</td></tr>
              ) : (
                payments.map((row: any, i: number) => {
                  const mode  = row.paymentMode ?? row.mode ?? 'OTHER';
                  const share = Number(totalAmount) > 0 ? (Number(row.totalAmount ?? 0) / Number(totalAmount)) * 100 : 0;
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${paymentModeColors[mode] ?? paymentModeColors['OTHER']}`}>
                          {mode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          (row.status ?? '').toLowerCase() === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.status ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">{row.transactionCount ?? row.count ?? 0}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{Number(row.totalAmount ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-[#008BE9] rounded-full" style={{ width: `${Math.min(share, 100).toFixed(1)}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 w-10 text-right">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              {payments.length > 0 && (
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={2} className="py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase">Total</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">{totalTransactions}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{Number(totalAmount).toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">100%</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Shifts ─────────────────────────────────────────────────────────────────────

function ShiftsReportView({ data }: { data: ShiftsReport }) {
  // Handle: plain array, { shifts: [] }, { data: [] }, or any object with an array value
  const shifts: any[] = Array.isArray(data)
    ? (data as any[])
    : (data as any).shifts
      ?? (data as any).data
      ?? Object.values(data as any).find((v) => Array.isArray(v))
      ?? [];

  // Real field names from API: shiftStart, shiftEnd, terminal.name, staff.name
  const openShifts = shifts.filter((s: any) => (s.status ?? '').toUpperCase() === 'OPEN').length;
  const totalVariance = shifts.reduce((sum: number, s: any) => sum + Number(s.variance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Shifts"    value={shifts.length}                              icon={Clock}       color="blue"   />
        <StatCard label="Open Shifts"     value={openShifts}                                 icon={TrendingUp}  color="green"  />
        <StatCard label="Closed Shifts"   value={shifts.length - openShifts}                 icon={TrendingDown} color="amber" />
        <StatCard label="Total Variance"  value={`₹${Number(totalVariance).toFixed(2)}`}     icon={IndianRupee} color="purple" />
      </div>

      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Terminal</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Staff</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Shift Start</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Shift End</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Opening Cash</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Closing Cash</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Expected</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Variance</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400">No shift data</td></tr>
              ) : (
                shifts.map((row: any, i: number) => {
                  const terminalName = row.terminal?.name ?? row.terminalName ?? row.terminalId ?? '—';
                  const staffName    = row.staff?.name ?? row.staffName ?? row.openedBy ?? '—';
                  const shiftStart   = row.shiftStart ?? row.openedAt;
                  const shiftEnd     = row.shiftEnd   ?? row.closedAt;
                  const variance     = Number(row.variance ?? 0);

                  return (
                    <tr key={row.id ?? i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{terminalName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{staffName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                        {shiftStart ? new Date(shiftStart).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                        {shiftEnd ? new Date(shiftEnd).toLocaleString() : <span className="text-slate-400 italic">Open</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">₹{Number(row.openingCash ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {row.closingCash != null ? `₹${Number(row.closingCash).toFixed(2)}` : <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {row.expectedCash != null ? `₹${Number(row.expectedCash).toFixed(2)}` : <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {variance > 0 ? '+' : ''}₹{variance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          (row.status ?? '').toUpperCase() === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.status ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              {shifts.length > 0 && (
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={6} className="py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase">Total</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₹{shifts.reduce((s: number, r: any) => s + Number(r.expectedCash ?? 0), 0).toFixed(2)}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-bold ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalVariance > 0 ? '+' : ''}₹{totalVariance.toFixed(2)}
                  </td>
                  <td />
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
