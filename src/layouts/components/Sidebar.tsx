import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, GraduationCap, Building, ShoppingCart, ArrowRight, ChevronDown, Database, Shield, Key, Users, Utensils, Clock, UserPlus, Search, Monitor, PlayCircle, Receipt, CreditCard, Wallet, BarChart2, BookOpen, Folder, Settings, AlertTriangle, Trophy, Home, Swords, Award, Medal, Bell, Building2, UserCheck, LogIn, MessageSquare, Calendar, Boxes, Tag, MapPin, Truck, Package, ClipboardList, Tags, ClipboardCheck, Wrench, Contact, BellRing, Bus, Route } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/ui.store';

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
    path: '/sales-purchase', 
    label: 'Sales & Purchase', 
    icon: ShoppingCart,
    children: [
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
      { path: '/accounts/roles', label: 'Roles', icon: Shield },
      { path: '/accounts/users', label: 'Users', icon: Users },
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
              {navItems.map((item) => renderNavItem(item))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
