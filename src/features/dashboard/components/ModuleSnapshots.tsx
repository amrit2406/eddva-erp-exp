import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BedDouble,
  BookOpen,
  Boxes,
  Bus,
  Calculator,
  ClipboardList,
  GraduationCap,
  School,
  ShoppingCart,
  Trophy,
  UtensilsCrossed,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import type { DashboardData } from '../types/dashboard.types';
import { rupees, toNumber } from '../utils/format';

interface Snapshot {
  title: string;
  icon: LucideIcon;
  to: string;
  lines: [string, string | number][];
}

function buildSnapshots(data: DashboardData): Snapshot[] {
  const { accounts, sales_purchase: sp, inventory, admission, hostel, canteen, library, sports, transport, front_office: fo, alumni } = data;
  const snapshots: (Snapshot | undefined)[] = [
    accounts && {
      title: 'Accounts',
      icon: Calculator,
      to: '/accounts/dashboard',
      lines: [
        ['Financial year', accounts.open_financial_year ? `FY ${accounts.open_financial_year.fyLabel}` : 'None open'],
        ['Vouchers this month', accounts.vouchers_posted_this_month],
        ['Ledger accounts', accounts.active_ledger_accounts],
        ['Cost centers', accounts.active_cost_centers],
      ],
    },
    sp && {
      title: 'Sales & Purchase',
      icon: ShoppingCart,
      to: '/sales-purchase/dashboard',
      lines: [
        ['Open sales orders', sp.sales.sales_orders.open_count],
        ['Open purchase orders', sp.purchase.purchase_orders.open_count],
        ['Customers / vendors', `${sp.customer_count} / ${sp.vendor_count}`],
        ['Active items', sp.active_item_count],
      ],
    },
    inventory && {
      title: 'Inventory',
      icon: Boxes,
      to: '/inventory',
      lines: [
        ['Items', inventory.total_items],
        ['Low stock', inventory.low_stock_items],
        ['Assets issued', `${inventory.assets.issued} of ${inventory.assets.total}`],
        ['Overdue returns', inventory.overdue_returns],
      ],
    },
    admission && {
      title: 'Admission',
      icon: School,
      to: '/admission/dashboard',
      lines: [
        ['Enquiries', admission.kpis.total_enquiries],
        ['Applications', admission.kpis.applications],
        ['Confirmed admissions', admission.kpis.confirmed_admissions],
        ['Seats available', `${admission.seats.available} of ${admission.seats.total_seats}`],
      ],
    },
    hostel && {
      title: 'Hostel',
      icon: BedDouble,
      to: '/hostel/dashboard',
      lines: [
        ['Occupancy', `${hostel.occupancy.occupancy_percentage}%`],
        ['Active residents', hostel.occupancy.residents.active],
        ['Present today', hostel.attendance.present],
        ['Fees outstanding', rupees(toNumber(hostel.fees.outstanding))],
      ],
    },
    canteen && {
      title: 'Canteen',
      icon: UtensilsCrossed,
      to: '/canteen/dashboard',
      lines: [
        ["Today's orders", canteen.todays_order_count],
        ["Today's revenue", rupees(canteen.todays_revenue)],
        ['Open POS shifts', canteen.active_pos_shifts],
        ['Members', canteen.total_members],
      ],
    },
    library && {
      title: 'Library',
      icon: BookOpen,
      to: '/library/dashboard',
      lines: [
        ['Books', library.total_books],
        ['Currently issued', library.currently_issued],
        ['Overdue', library.overdue],
        ['Members', library.total_members],
      ],
    },
    transport && {
      title: 'Transport',
      icon: Bus,
      to: '/transport/dashboard',
      lines: [
        ['Active vehicles', transport.active_vehicles],
        ['Routes', transport.total_routes],
        ['Passengers', transport.active_passengers],
        ['Fees this month', rupees(transport.fee_collection_this_month)],
      ],
    },
    sports && {
      title: 'Sports',
      icon: Trophy,
      to: '/sports/dashboard',
      lines: [
        ['Ongoing tournaments', sports.ongoing_tournaments],
        ['Upcoming fixtures', sports.upcoming_fixtures],
        ['Participants', sports.total_participants],
        ['Houses', sports.total_houses],
      ],
    },
    fo && {
      title: 'Front Office',
      icon: ClipboardList,
      to: '/front-office',
      lines: [
        ['Enquiries in progress', fo.enquiries.in_progress],
        ["Today's appointments", fo.appointments.today],
        ['Open complaints', fo.complaints.open + fo.complaints.in_progress],
        ['Avg. resolution', `${fo.complaints.average_resolution_hours} h`],
      ],
    },
    alumni && {
      title: 'Alumni',
      icon: GraduationCap,
      to: '/alumni/dashboard',
      lines: [
        ['Alumni', alumni.alumni.total],
        ['Upcoming events', alumni.events.upcoming],
        ['Open jobs', alumni.jobs.open],
        ['Active campaigns', alumni.donations.active_campaigns],
      ],
    },
  ];
  return snapshots.filter((s): s is Snapshot => !!s);
}

export default function ModuleSnapshots({ data }: { data: DashboardData }) {
  const snapshots = buildSnapshots(data);
  if (snapshots.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Modules</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {snapshots.map(({ title, icon: Icon, to, lines }) => (
          <Card key={title} className="p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008BE9]/10">
                <Icon className="h-4 w-4 text-[#002C6D]" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
            </div>
            <dl className="space-y-1.5 flex-1">
              {lines.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900 tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <Link to={to} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
              Open dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
