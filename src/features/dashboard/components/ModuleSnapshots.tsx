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
import type { DashboardData } from '../types/dashboard.types';
import { rupees, toNumber } from '../utils/format';

interface Snapshot {
  title: string;
  icon: LucideIcon;
  // Decorative identity color; the title carries the meaning.
  accent: string;
  to: string;
  lines: [string, string | number][];
}

function buildSnapshots(data: DashboardData): Snapshot[] {
  const { accounts, sales_purchase: sp, inventory, admission, hostel, canteen, library, sports, transport, front_office: fo, alumni } = data;
  const snapshots: (Snapshot | undefined)[] = [
    accounts && {
      title: 'Accounts',
      accent: '#008BE9',
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
      accent: '#eb6834',
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
      accent: '#15936a',
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
      accent: '#4a3aa7',
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
      accent: '#d55181',
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
      accent: '#c98500',
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
      accent: '#0a55a4',
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
      accent: '#0891b2',
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
      accent: '#e34948',
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
      accent: '#7c3aed',
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
      accent: '#008300',
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
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Modules</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Everything at a glance</h2>
        </div>
        <p className="text-xs text-slate-500">{snapshots.length} modules</p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {snapshots.map(({ title, icon: Icon, accent, to, lines }, index) => (
          <Link
            key={title}
            to={to}
            className="animate-rise group relative flex flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
          >
            {/* Accent wash across the top that deepens on hover. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `linear-gradient(180deg, ${accent}1f, transparent)` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-50"
              style={{ background: accent }}
            />
            <div className="relative flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}b3)`, boxShadow: `0 8px 18px -8px ${accent}` }}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold tracking-tight text-slate-900">{title}</h3>
              <span
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/80 ring-1 ring-slate-200 transition-all duration-300 group-hover:translate-x-0.5"
                style={{ color: accent }}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <dl className="relative grid grid-cols-2 gap-2 flex-1">
              {lines.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50/90 px-3 py-2 ring-1 ring-slate-100">
                  <dt className="text-[11px] text-slate-500 truncate">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </Link>
        ))}
      </div>
    </section>
  );
}
