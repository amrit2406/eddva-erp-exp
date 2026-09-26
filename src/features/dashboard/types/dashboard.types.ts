// Shape of GET /dashboard/summary — one block per module, each identical to
// that module's own /<module>/dashboard/summary response, so the module types
// are reused here rather than duplicated.
import type { AccountsDashboardSummary } from '../../accounts/api/dashboard.api';
import type { AdmissionDashboardSummary } from '../../admission/api/admission.api';
import type { AlumniDashboardSummary } from '../../alumni/api/dashboard.api';
import type { CanteenDashboardSummary } from '../../canteen/api/dashboard.api';
import type { FrontOfficeDashboardSummary } from '../../front-office/types/dashboardRecord.types';
import type { HostelDashboardSummary } from '../../hostel/api/hostel.api';
import type { InventoryDashboardSummary } from '../../inventory/types/dashboard.types';
import type { LibraryDashboardSummary } from '../../library/api/dashboard.api';
import type { DashboardSummary as SalesPurchaseDashboardSummary } from '../../sales-purchase/types/sales-purchase.types';
import type { SportsDashboardSummary } from '../../sports/api/dashboard.api';
import type { TransportDashboardSummary } from '../../transport/api/dashboard.api';

export interface DateRange {
  from: string | null;
  to: string | null;
}

// Modules the caller can't see (or that fail server-side) may be missing.
export interface DashboardData {
  accounts?: AccountsDashboardSummary;
  sales_purchase?: SalesPurchaseDashboardSummary;
  canteen?: CanteenDashboardSummary;
  library?: LibraryDashboardSummary;
  sports?: SportsDashboardSummary;
  transport?: TransportDashboardSummary;
  front_office?: FrontOfficeDashboardSummary;
  inventory?: InventoryDashboardSummary;
  admission?: AdmissionDashboardSummary;
  hostel?: HostelDashboardSummary;
  alumni?: AlumniDashboardSummary;
}
