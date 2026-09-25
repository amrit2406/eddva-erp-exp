import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { DashboardData } from '../types/dashboard.types';
import { rupees, toNumber } from '../utils/format';

type Severity = 'critical' | 'warning';

interface AttentionItem {
  module: string;
  label: string;
  count: number;
  detail?: string;
  // For amounts where the count is just a 0/1 flag.
  hideCount?: boolean;
  severity: Severity;
  to: string;
}

// Status colors are reserved for state and always paired with an icon + text.
const SEVERITY_COLOR: Record<Severity, string> = { critical: '#d03b3b', warning: '#fab219' };

// Everything across modules that someone should act on. Zero counts are dropped.
function collectItems(data: DashboardData): AttentionItem[] {
  const { accounts, sales_purchase: sp, canteen, library, transport, front_office: fo, inventory, admission, hostel, alumni } = data;
  const items: (AttentionItem | false | undefined)[] = [
    transport && { module: 'Transport', label: 'Unresolved alerts', count: transport.unresolved_alerts, severity: 'critical', to: '/transport/dashboard' },
    library && { module: 'Library', label: 'Overdue books', count: library.overdue, severity: 'critical', to: '/library/dashboard' },
    hostel && { module: 'Hostel', label: 'Overdue gate passes', count: hostel.gate.overdue_passes, severity: 'critical', to: '/hostel/dashboard' },
    hostel && { module: 'Hostel', label: 'Urgent complaints', count: hostel.complaints.urgent, severity: 'critical', to: '/hostel/dashboard' },
    fo && { module: 'Front office', label: 'Overdue follow-ups', count: fo.enquiries.overdue_followups, severity: 'critical', to: '/front-office' },
    inventory && { module: 'Inventory', label: 'Overdue returns', count: inventory.overdue_returns, severity: 'critical', to: '/inventory' },
    sp && {
      module: 'Sales',
      label: 'Overdue sales invoices',
      count: sp.sales.invoices.overdue_count,
      detail: rupees(sp.sales.invoices.overdue_amount),
      severity: 'critical',
      to: '/sales-purchase/dashboard',
    },
    sp && {
      module: 'Purchase',
      label: 'Overdue purchase invoices',
      count: sp.purchase.invoices.overdue_count,
      detail: rupees(sp.purchase.invoices.overdue_amount),
      severity: 'critical',
      to: '/sales-purchase/dashboard',
    },
    hostel && {
      module: 'Hostel',
      label: 'Overdue fee invoices',
      count: hostel.fees.overdue_invoices,
      detail: rupees(toNumber(hostel.fees.overdue_amount)),
      severity: 'critical',
      to: '/hostel/dashboard',
    },
    sp && {
      module: 'Purchase',
      label: 'POs awaiting approval',
      count: sp.purchase.purchase_orders.pending_approval_count,
      detail: rupees(sp.purchase.purchase_orders.pending_approval_value),
      severity: 'warning',
      to: '/sales-purchase/dashboard',
    },
    accounts && { module: 'Accounts', label: 'Draft vouchers pending', count: accounts.draft_vouchers_pending, severity: 'warning', to: '/accounts/dashboard' },
    canteen && { module: 'Canteen', label: 'Unpaid orders', count: canteen.unpaid_orders, severity: 'warning', to: '/canteen/dashboard' },
    inventory && { module: 'Inventory', label: 'Low-stock items', count: inventory.low_stock_items, severity: 'warning', to: '/inventory' },
    admission && { module: 'Admission', label: 'Enquiry follow-ups due', count: admission.kpis.enquiry_followups_due, severity: 'warning', to: '/admission/dashboard' },
    hostel && { module: 'Hostel', label: 'Gate passes to approve', count: hostel.gate.pending_approvals, severity: 'warning', to: '/hostel/dashboard' },
    hostel && {
      module: 'Hostel',
      label: 'Unmarked attendance',
      count: Object.values(hostel.attendance.unmarked ?? {}).reduce((sum, n) => sum + n, 0),
      severity: 'warning',
      to: '/hostel/dashboard',
    },
    alumni && { module: 'Alumni', label: 'Profiles to verify', count: alumni.alumni.pending_verification, severity: 'warning', to: '/alumni/dashboard' },
    alumni && { module: 'Alumni', label: 'Failed newsletter deliveries', count: alumni.communication.failed_deliveries, severity: 'warning', to: '/alumni/dashboard' },
    library && {
      module: 'Library',
      label: 'Pending fines',
      count: library.pending_fines_total > 0 ? 1 : 0,
      detail: rupees(library.pending_fines_total),
      hideCount: true,
      severity: 'warning',
      to: '/library/dashboard',
    },
  ];
  return items.filter((item): item is AttentionItem => !!item && item.count > 0);
}

export default function AttentionList({ data }: { data: DashboardData }) {
  const items = collectItems(data);

  if (items.length === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
        <CheckCircle2 className="h-6 w-6" style={{ color: '#0ca30c' }} />
        Nothing needs attention right now
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 -mx-2">
      {items.map((item) => (
        <li key={`${item.module}-${item.label}`}>
          <Link to={item.to} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-slate-50">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: SEVERITY_COLOR[item.severity] }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 truncate">{item.label}</p>
              <p className="text-xs text-slate-500">
                {item.module}
                {item.detail && ` · ${item.detail}`}
              </p>
            </div>
            {!item.hideCount && (
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{item.count}</span>
            )}
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
