import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRightLeft, BedDouble, Briefcase, Gift, GitBranch, Handshake, HeartHandshake, Mail, CalendarCheck, Gavel, DoorOpen, BadgeCheck, LayoutDashboard, GraduationCap, Building, ShoppingCart, ArrowRight, ChevronDown, Database, Shield, Key, Users, Utensils, Clock, UserPlus, Search, Monitor, PlayCircle, Receipt, CreditCard, Wallet, BarChart2, BookOpen, Folder, Settings, AlertTriangle, Trophy, Home, Swords, Award, Medal, Bell, Building2, UserCheck, LogIn, MessageSquare, Calendar, Boxes, Tag, MapPin, Truck, Package, ClipboardList, Tags, ClipboardCheck, Wrench, Contact, BellRing, Bus, Route } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/ui.store';
import { useIsInstituteAdmin } from '../../features/sales-purchase/utils/rbac.utils';
import { useIsInstituteAdmin as useIsCanteenInstituteAdmin } from '../../features/canteen/utils/rbac.utils';
import { useIsInstituteAdmin as useIsAdmissionInstituteAdmin } from '../../features/admission/utils/rbac.utils';
import { useIsInstituteAdmin as useIsHostelInstituteAdmin } from '../../features/hostel/utils/rbac.utils';
import { useIsInstituteAdmin as useIsAlumniInstituteAdmin } from '../../features/alumni/utils/rbac.utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    path: '/sales-purchase', 
    label: 'Sales & Purchase', 
    icon: ShoppingCart,
    children: [
      { path: '/sales-purchase/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/sales-purchase/permissions', label: 'Permissions', icon: Key },
      { path: '/sales-purchase/roles', label: 'Roles', icon: Shield },
      { path: '/sales-purchase/users', label: 'Users', icon: Users },
      { path: '/sales-purchase/item-categories', label: 'Item Categories', icon: Database },
      { path: '/sales-purchase/uom', label: 'Units of Measure', icon: Database },
      { path: '/sales-purchase/tax-codes', label: 'Tax Codes', icon: Database },
      { path: '/sales-purchase/payment-terms', label: 'Payment Terms', icon: Database },
      { path: '/sales-purchase/warehouses', label: 'Warehouses', icon: Database },
      { path: '/sales-purchase/items', label: 'Items', icon: Database },
      { path: '/sales-purchase/vendors', label: 'Vendors', icon: Database },
      { path: '/sales-purchase/customers', label: 'Customers', icon: Database },
      { path: '/sales-purchase/purchase-orders', label: 'Purchase Orders', icon: Database },
      { path: '/sales-purchase/approval-rules', label: 'PO Approval Rules', icon: Database },
      { path: '/sales-purchase/grn', label: 'Goods Received Notes', icon: Database },
      { path: '/sales-purchase/invoices', label: 'Purchase-Invoices', icon: Database },
      { path: '/sales-purchase/payments', label: 'Purchase-Payments', icon: Database },
      { path: '/sales-purchase/sales-orders', label: 'Sales Orders', icon: Database },
      { path: '/sales-purchase/sales-invoices', label: 'Sales Invoices', icon: Database },
      { path: '/sales-purchase/sales-receipts', label: 'Sales Receipts', icon: Database },
      { path: '/sales-purchase/purchase-register', label: 'Purchase Register', icon: Database },
      { path: '/sales-purchase/sales-register', label: 'Sales Register', icon: Database },
    ]
  },
  { 
    path: '/canteen', 
    label: 'Canteen Management', 
    icon: Utensils,
    children: [
      { path: '/canteen/permissions', label: 'Permissions', icon: Key },
      { path: '/canteen/roles', label: 'Roles', icon: Shield },
      { path: '/canteen/users', label: 'Users', icon: Users },
      { path: '/canteen/members', label: 'Members', icon: UserPlus },
      // { path: '/canteen/members/lookup', label: 'Member Lookup', icon: Search },
      { path: '/canteen/menu/categories', label: 'Menu Categories', icon: Database },
      { path: '/canteen/menu/items', label: 'Menu Items', icon: Utensils },
      { path: '/canteen/menu/schedules', label: 'Menu Schedules', icon: Clock },
      { path: '/canteen/pos/terminals', label: 'POS Terminals', icon: Monitor },
      { path: '/canteen/pos/shifts', label: 'Shifts', icon: PlayCircle },
      { path: '/canteen/orders', label: 'Orders', icon: Receipt },
      { path: '/canteen/wallets', label: 'Wallets & Ledger', icon: Wallet },
      { path: '/canteen/reports', label: 'Reports & Analytics', icon: BarChart2 },
    ]
  },
  {
    path: '/admission',
    label: 'Admission',
    icon: GraduationCap,
    children: [
      { path: '/admission/permissions', label: 'Permissions', icon: Key },
      { path: '/admission/roles', label: 'Roles', icon: Shield },
      { path: '/admission/users', label: 'Users', icon: Users },
      { path: '/admission/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admission/sessions', label: 'Academic Sessions', icon: Calendar },
      { path: '/admission/programs', label: 'Programs', icon: BookOpen },
      { path: '/admission/enquiries', label: 'Enquiries & Leads', icon: MessageSquare },
      { path: '/admission/applicants', label: 'Applicants', icon: UserPlus },
      { path: '/admission/applications', label: 'Applications', icon: ClipboardList },
      { path: '/admission/tests', label: 'Entrance Tests', icon: ClipboardCheck },
      { path: '/admission/interviews', label: 'Interviews', icon: UserCheck },
      { path: '/admission/merit-lists', label: 'Merit Lists', icon: Medal },
      { path: '/admission/offers', label: 'Offers', icon: Award },
      { path: '/admission/payments', label: 'Admission Payments', icon: CreditCard },
      { path: '/admission/confirmations', label: 'Confirmations', icon: BadgeCheck },
      { path: '/admission/reports', label: 'Reports', icon: BarChart2 },
      { path: '/admission/notifications', label: 'Notification Log', icon: Bell },
      { path: '/admission/fee-structures', label: 'Fee Structures', icon: Wallet },
    ]
  },
  {
    path: '/hostel',
    label: 'Hostel',
    icon: Home,
    children: [
      { path: '/hostel/permissions', label: 'Permissions', icon: Key },
      { path: '/hostel/roles', label: 'Roles', icon: Shield },
      { path: '/hostel/users', label: 'Users', icon: Users },
      { path: '/hostel/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/hostel/alerts', label: 'Alerts', icon: AlertTriangle },
      { path: '/hostel/residents', label: 'Residents', icon: UserCheck },
      { path: '/hostel/allotments', label: 'Allotments', icon: ClipboardList },
      { path: '/hostel/transfer-requests', label: 'Transfer Requests', icon: ArrowRightLeft },
      { path: '/hostel/gate-passes', label: 'Gate Passes', icon: LogIn },
      { path: '/hostel/gate-passes/scan', label: 'Gate Scan', icon: ClipboardCheck },
      { path: '/hostel/attendance', label: 'Attendance', icon: Calendar },
      { path: '/hostel/blocks', label: 'Blocks', icon: Building2 },
      { path: '/hostel/rooms', label: 'Rooms', icon: DoorOpen },
      { path: '/hostel/beds', label: 'Beds', icon: BedDouble },
      { path: '/hostel/visitors', label: 'Visitors', icon: Contact },
      { path: '/hostel/mess-menu', label: 'Mess Menu', icon: Utensils },
      { path: '/hostel/mess-attendance', label: 'Mess Attendance', icon: CalendarCheck },
      { path: '/hostel/complaints', label: 'Complaints', icon: Wrench },
      { path: '/hostel/fee-plans', label: 'Fee Plans', icon: Tags },
      { path: '/hostel/invoices', label: 'Fee Invoices', icon: Receipt },
      { path: '/hostel/payments', label: 'Fee Payments', icon: CreditCard },
      { path: '/hostel/discipline', label: 'Discipline', icon: Gavel },
      { path: '/hostel/reports', label: 'Reports', icon: BarChart2 },
      { path: '/hostel/notifications', label: 'Notification Log', icon: Bell },
    ]
  },
  {
    path: '/alumni',
    label: 'Alumni',
    icon: GraduationCap,
    children: [
      { path: '/alumni/permissions', label: 'Permissions', icon: Key },
      { path: '/alumni/roles', label: 'Roles', icon: Shield },
      { path: '/alumni/users', label: 'Users', icon: Users },
      { path: '/alumni/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/alumni/register', label: 'Register Alumni', icon: UserPlus },
      { path: '/alumni/profiles', label: 'Directory', icon: Contact },
      { path: '/alumni/public-directory', label: 'Public Directory', icon: Search },
      { path: '/alumni/me', label: 'My Profile', icon: UserCheck },
      { path: '/alumni/me/verification', label: 'My Verification', icon: BadgeCheck },
      { path: '/alumni/me/notifications', label: 'My Notifications', icon: BellRing },
      { path: '/alumni/groups', label: 'Groups', icon: Users },
      { path: '/alumni/events', label: 'Events', icon: Calendar },
      { path: '/alumni/event-registrations', label: 'Event Registrations', icon: CreditCard },
      { path: '/alumni/jobs', label: 'Job Board', icon: Briefcase },
      { path: '/alumni/job-applications', label: 'Job Applications', icon: ClipboardList },
      { path: '/alumni/mentorship-programs', label: 'Mentorship Programs', icon: Handshake },
      { path: '/alumni/mentors', label: 'Mentors', icon: UserCheck },
      { path: '/alumni/mentorship-matches', label: 'Mentorship Matches', icon: GitBranch },
      { path: '/alumni/campaigns', label: 'Campaigns', icon: HeartHandshake },
      { path: '/alumni/donations', label: 'Donations', icon: Gift },
      { path: '/alumni/newsletters', label: 'Newsletters', icon: Mail },
      { path: '/alumni/communication-logs', label: 'Communication Logs', icon: MessageSquare },
      { path: '/alumni/reports', label: 'Reports', icon: BarChart2 },
      { path: '/alumni/notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    path: '/library',
    label: 'Library',
    icon: BookOpen,
    children: [
      { path: '/library/permissions', label: 'Permissions', icon: Key },
      { path: '/library/roles', label: 'Roles', icon: Shield },
      { path: '/library/users', label: 'Users', icon: Users },
      { path: '/library/categories', label: 'Categories', icon: Folder },
      { path: '/library/membership-rules', label: 'Membership Rules', icon: Settings },
      { path: '/library/members', label: 'Members', icon: UserPlus },
      { path: '/library/books', label: 'Books', icon: BookOpen },
      { path: '/library/issues', label: 'Issues', icon: AlertTriangle },
      { path: '/library/reservations', label: 'Reservations', icon: Clock },
    ]
  },
  {
    path: '/front-office',
    label: 'Front Office',
    icon: Building,
    children: [
      { path: '/front-office', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/front-office/permissions', label: 'Permissions', icon: Key },
      { path: '/front-office/roles', label: 'Roles', icon: Shield },
      { path: '/front-office/users', label: 'Users', icon: Users },
      { path: '/front-office/notifications', label: 'Notifications', icon: Bell },
      { path: '/front-office/departments', label: 'Departments', icon: Building2 },
      { path: '/front-office/employees', label: 'Employees', icon: UserPlus },
      { path: '/front-office/employees/available', label: 'Available Employees', icon: Search },
      { path: '/front-office/visitors', label: 'Visitors', icon: UserCheck },
      { path: '/front-office/visitor-logs', label: 'Visitor Logs', icon: LogIn },
      { path: '/front-office/enquiries', label: 'Enquiries', icon: MessageSquare },
      { path: '/front-office/appointments', label: 'Appointments', icon: Calendar },
      { path: '/front-office/complaints', label: 'Complaints', icon: AlertTriangle },
    ]
  },
  {
    path: '/sports',
    label: 'Sports',
    icon: Trophy,
    children: [
      { path: '/sports/permissions', label: 'Permissions', icon: Key },
      { path: '/sports/roles', label: 'Roles', icon: Shield },
      { path: '/sports/users', label: 'Users', icon: Users },
      { path: '/sports/catalog', label: 'Sports Catalog', icon: Trophy },
      { path: '/sports/venues', label: 'Venues', icon: Building },
      { path: '/sports/staff', label: 'Staff', icon: UserPlus },
      { path: '/sports/participants', label: 'Participants', icon: Users },
      { path: '/sports/houses', label: 'Houses', icon: Home },
      { path: '/sports/tournaments', label: 'Tournaments', icon: Swords },
      { path: '/sports/records', label: 'Records', icon: Award },
      { path: '/sports/awards', label: 'Awards', icon: Medal },
    ]
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: Boxes,
    children: [
      { path: '/inventory', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/inventory/permissions', label: 'Permissions', icon: Key },
      { path: '/inventory/roles', label: 'Roles', icon: Shield },
      { path: '/inventory/users', label: 'Users', icon: Users },
      { path: '/inventory/categories', label: 'Categories', icon: Tag },
      { path: '/inventory/locations', label: 'Locations', icon: MapPin },
      { path: '/inventory/vendors', label: 'Vendors', icon: Truck },
      { path: '/inventory/items', label: 'Items', icon: Package },
      { path: '/inventory/stock/purchases', label: 'Stock Register', icon: ClipboardList },
      { path: '/inventory/assets', label: 'Assets', icon: Tags },
      { path: '/inventory/issues', label: 'Issues & Returns', icon: ClipboardCheck },
      { path: '/inventory/maintenance', label: 'Asset Maintenance', icon: Wrench },
      { path: '/inventory/holders', label: 'Holders', icon: Contact },
      { path: '/inventory/alerts', label: 'Alerts', icon: BellRing },
    ]
  },
  {
    path: '/transport',
    label: 'Transport',
    icon: Bus,
    children: [
      { path: '/transport/permissions', label: 'Permissions', icon: Key },
      { path: '/transport/roles', label: 'Roles', icon: Shield },
      { path: '/transport/users', label: 'Users', icon: Users },
      { path: '/transport/vehicles', label: 'Vehicles', icon: Bus },
      { path: '/transport/routes', label: 'Routes', icon: Route },
      { path: '/transport/passengers', label: 'Passengers', icon: UserPlus },
      { path: '/transport/drivers', label: 'Drivers', icon: Contact },
      { path: '/transport/tracking', label: 'Tracking Alerts', icon: AlertTriangle },
      { path: '/transport/fees/plans', label: 'Fee Plans', icon: CreditCard },
    ]
  },
  {
    path: '/accounts',
    label: 'Accounts',
    icon: Wallet,
    children: [
      { path: '/accounts/permissions', label: 'Permissions', icon: Key },
      { path: '/accounts/roles', label: 'Roles', icon: Shield },
      { path: '/accounts/users', label: 'Users', icon: Users },
      { path: '/accounts/coa/groups', label: 'Account Groups', icon: Folder },
      { path: '/accounts/coa/ledger-accounts', label: 'Ledger Accounts', icon: BookOpen },
      { path: '/accounts/cost-centers', label: 'Cost Centers', icon: Building2 },
      { path: '/accounts/financial-years', label: 'Financial Years', icon: Calendar },
      { path: '/accounts/vouchers', label: 'Vouchers', icon: Receipt },
      { path: '/accounts/reports', label: 'Reports', icon: BarChart2 },
      { path: '/accounts/account-mappings', label: 'Account Mappings', icon: Settings },
    ]
  },
  // { path: '/students', label: 'Students', icon: Users },
  // { path: '/teachers', label: 'Teachers', icon: GraduationCap },
  // { path: '/attendance', label: 'Attendance', icon: Calendar },
  // { path: '/fees', label: 'Fees', icon: IndianRupee },
  // { path: '/examinations', label: 'Examinations', icon: FileText },
  // { path: '/reports', label: 'Reports', icon: FileText },
  // { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const isSalesPurchaseAdmin = useIsInstituteAdmin();
  const isCanteenAdmin = useIsCanteenInstituteAdmin();
  const isAdmissionAdmin = useIsAdmissionInstituteAdmin();
  const isHostelAdmin = useIsHostelInstituteAdmin();
  const isAlumniAdmin = useIsAlumniInstituteAdmin();
  const visibleNavItems = navItems.map((item) => {
    if (item.path === '/sales-purchase' && item.children && !isSalesPurchaseAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/sales-purchase/roles' && child.path !== '/sales-purchase/users'
        ),
      };
    }
    if (item.path === '/canteen' && item.children && !isCanteenAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/canteen/roles' && child.path !== '/canteen/users'
        ),
      };
    }
    if (item.path === '/admission' && item.children && !isAdmissionAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/admission/roles' && child.path !== '/admission/users'
        ),
      };
    }
    if (item.path === '/hostel' && item.children && !isHostelAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/hostel/roles' && child.path !== '/hostel/users'
        ),
      };
    }
    if (item.path === '/alumni' && item.children && !isAlumniAdmin) {
      return {
        ...item,
        children: item.children.filter(
          (child) => child.path !== '/alumni/roles' && child.path !== '/alumni/users'
        ),
      };
    }
    return item;
  });

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.path);

    if (hasChildren) {
      return (
        <li key={item.path}>
          <button
            onClick={() => toggleMenu(item.path)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
              'text-slate-700 hover:bg-slate-100'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </button>
          {isExpanded && (
            <ul className={cn('mt-1 space-y-1', level > 0 ? 'ml-4' : '')}>
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          onClick={() => {
            // Close sidebar on mobile after navigation
            if (window.innerWidth < 1024) {
              toggleSidebar();
            }
          }}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#008BE9]/10 text-[#002C6D]'
                : 'text-slate-700 hover:bg-slate-100'
            )
          }
        >
          {level > 0 && <ArrowRight className="h-4 w-4 text-slate-400" />}
          <item.icon className={cn('h-5 w-5', level > 0 ? 'h-4 w-4' : '')} />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-[#008BE9]/10 px-2 py-0.5 text-xs text-[#002C6D]">
              {item.badge}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay - only shows on mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #002C6D 0%, #008BE9 100%)' }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">School ERP</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {visibleNavItems.map((item) => renderNavItem(item))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
