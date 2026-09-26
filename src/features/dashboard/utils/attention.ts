import type { AttentionItem } from '../../../components/premium/AttentionList';
import type { DashboardData } from '../types/dashboard.types';
import { rupees, toNumber } from '../../../utils/dashboardFormat';

// Everything across modules that someone should act on. Zero counts are dropped.
export function collectAttentionItems(data: DashboardData): AttentionItem[] {
  const { accounts, sales_purchase: sp, canteen, library, transport, front_office: fo, inventory, admission, hostel, alumni } = data;
  const items: (AttentionItem | false | undefined)[] = [
    transport && { module: 'Transport', label: 'Unresolved alerts', count: transport.alerts.unresolved, severity: 'critical', to: '/transport/dashboard' },
    library && { module: 'Library', label: 'Overdue books', count: library.issues.overdue, severity: 'critical', to: '/library/dashboard' },
    canteen && {
      module: 'Canteen',
      label: 'POS cash variance',
      count: canteen.pos.totalVariance !== 0 ? 1 : 0,
      detail: `${rupees(Math.abs(canteen.pos.totalVariance))} ${canteen.pos.totalVariance > 0 ? 'over' : 'short'} expected`,
      hideCount: true,
      severity: 'critical',
      to: '/canteen/dashboard',
    },
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
    accounts && { module: 'Accounts', label: 'Draft vouchers pending', count: accounts.vouchers.draft_pending, severity: 'warning', to: '/accounts/dashboard' },
    canteen && { module: 'Canteen', label: 'Unpaid orders today', count: canteen.today.unpaid_orders, severity: 'warning', to: '/canteen/dashboard' },
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
      count: library.fines.pending_total > 0 ? 1 : 0,
      detail: rupees(library.fines.pending_total),
      hideCount: true,
      severity: 'warning',
      to: '/library/dashboard',
    },
  ];
  return items.filter((item): item is AttentionItem => !!item && item.count > 0);
}
