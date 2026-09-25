// Shape of GET /dashboard/summary — one block per module.
// Some money fields arrive as strings ("5000.00"); read them with toNumber().

type Numeric = number | string;

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface InvoiceTotals {
  period_count: number;
  period_subtotal: number;
  period_tax: number;
  period_discount: number;
  period_grand_total: number;
  outstanding_count: number;
  outstanding_amount: number;
  overdue_count: number;
  overdue_amount: number;
}

export interface AccountsSummary {
  active_ledger_accounts: number;
  open_financial_year: { id: string; fyLabel: string; startDate: string; endDate: string } | null;
  vouchers_posted_this_month: number;
  draft_vouchers_pending: number;
  active_cost_centers: number;
}

export interface SalesPurchaseSummary {
  range: DateRange;
  vendor_count: number;
  customer_count: number;
  active_item_count: number;
  purchase: {
    purchase_orders: {
      by_status: StatusCount[];
      open_count: number;
      pending_approval_count: number;
      pending_approval_value: number;
    };
    grns: { draft_count: number; posted_count: number };
    invoices: InvoiceTotals;
    top_vendors: { vendor_id: number; vendor_name: string; vendor_code: string; invoice_count: number; total_amount: number }[];
  };
  sales: {
    sales_orders: { by_status: StatusCount[]; open_count: number };
    invoices: InvoiceTotals;
    top_customers: {
      customer_id: number;
      customer_name: string;
      customer_code: string;
      invoice_count: number;
      total_amount: number;
    }[];
  };
}

export interface CanteenSummary {
  total_members: number;
  total_active_wallet_balance: number;
  todays_order_count: number;
  todays_revenue: number;
  active_pos_shifts: number;
  unpaid_orders: number;
}

export interface LibrarySummary {
  total_books: number;
  total_members: number;
  currently_issued: number;
  overdue: number;
  pending_fines_total: number;
}

export interface SportsSummary {
  total_participants: number;
  ongoing_tournaments: number;
  total_houses: number;
  total_records: number;
  upcoming_fixtures: number;
}

export interface TransportSummary {
  active_vehicles: number;
  total_routes: number;
  active_passengers: number;
  fee_collection_this_month: number;
  unresolved_alerts: number;
}

export interface FrontOfficeSummary {
  range: DateRange;
  visitors: {
    today_visitors: number;
    currently_checked_in: number;
    checked_out_today: number;
    by_day: { day: string; count: number }[];
    by_host: { host_employee_id: number; host_name: string; department: string; count: number }[];
  };
  enquiries: {
    total: number;
    open: number;
    in_progress: number;
    closed: number;
    by_source: { source: string; count: number }[];
    by_category: { category: string; count: number }[];
    pending_followups: number;
    overdue_followups: number;
  };
  appointments: {
    today: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  complaints: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    critical_or_high: number;
    by_category: { category: string; count: number }[];
    average_resolution_hours: number;
  };
}

export interface InventorySummary {
  range: DateRange;
  total_items: number;
  low_stock_items: number;
  stock_by_location: { location_id: number; location: string; quantity: number }[];
  todays_issues: number;
  overdue_returns: number;
  assets: {
    total: number;
    issued: number;
    idle: number;
    utilization_pct: number;
    by_status: StatusCount[];
  };
  category_wise_consumption: { category: string; issue_count: number }[];
  vendor_wise_purchases: { vendor_id: number; vendor: string; purchase_count: number; total_amount: number }[];
  stock_valuation: number;
}

export interface AdmissionSummary {
  kpis: {
    total_enquiries: number;
    new_enquiries: number;
    enquiry_followups_due: number;
    applications: number;
    applications_under_review: number;
    tests_scheduled: number;
    interviews_scheduled: number;
    shortlisted: number;
    offers_issued: number;
    offers_accepted: number;
    admission_fees_paid: { applications_fully_paid: number; payments_recorded: number; amount_collected: Numeric };
    confirmed_admissions: number;
    available_seats: number;
  };
  funnel: { stage: string; count: number }[];
  seats: { total_seats: number; offered: number; accepted: number; confirmed: number; available: number };
}

export interface HostelSummary {
  occupancy: {
    total_rooms: number;
    rooms_available: number;
    total_capacity: number;
    occupied_places: number;
    vacant_places: number;
    occupancy_percentage: number;
    residents: { total_residents: number; active: number; vacated: number; suspended: number };
  };
  gate: {
    currently_out: number;
    expected_returns_today: number;
    overdue_passes: number;
    todays_outings: number;
    todays_returns: number;
    pending_approvals: number;
  };
  attendance: {
    date: string;
    present: number;
    absent: number;
    on_leave: number;
    unaccounted_absences: number;
    unmarked: Record<string, number>;
  };
  complaints: { open: number; in_progress: number; urgent: number; unassigned: number; resolved: number; closed: number };
  fees: {
    total_invoices: number;
    total_due: Numeric;
    total_paid: Numeric;
    outstanding: Numeric;
    outstanding_invoices: number;
    overdue_invoices: number;
    overdue_amount: Numeric;
  };
  mess: {
    date: string;
    expected_meals: number;
    opted_in: number;
    opted_out: number;
    consumed: number;
    missed: number;
    by_meal: { meal_type: string; opted_in: number; opted_out: number; consumed: number; missed: number; expected_meals: number }[];
  };
}

export interface AlumniSummary {
  alumni: { total: number; verified: number; pending_verification: number };
  events: { upcoming: number; registrations_for_upcoming: number; revenue: number };
  jobs: { open: number; applications: number; hired: number };
  mentorship: { active_programs: number; available_mentors: number; active_matches: number };
  donations: { active_campaigns: number; total: number; donors: number };
  communication: { newsletters_sent: number; failed_deliveries: number };
}

// Modules the caller can't see (or that fail server-side) may be missing.
export interface DashboardData {
  accounts?: AccountsSummary;
  sales_purchase?: SalesPurchaseSummary;
  canteen?: CanteenSummary;
  library?: LibrarySummary;
  sports?: SportsSummary;
  transport?: TransportSummary;
  front_office?: FrontOfficeSummary;
  inventory?: InventorySummary;
  admission?: AdmissionSummary;
  hostel?: HostelSummary;
  alumni?: AlumniSummary;
}
