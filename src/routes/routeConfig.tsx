import { ROUTES } from '../constants/routes';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';

import FrontOfficeDashboardPage from '../features/front-office/pages/FrontOfficeDashboardPage';
import VisitorsPage from '../features/front-office/pages/visitors/VisitorsPage';
import CreateVisitorPage from '../features/front-office/pages/visitors/CreateVisitorPage';
import VisitorDetailsPage from '../features/front-office/pages/visitors/VisitorDetailsPage';
import EditVisitorPage from '../features/front-office/pages/visitors/EditVisitorPage';
import EnquiriesPage from '../features/front-office/pages/enquiries/EnquiriesPage';
import CreateEnquiryPage from '../features/front-office/pages/enquiries/CreateEnquiryPage';
import EnquiryDetailsPage from '../features/front-office/pages/enquiries/EnquiryDetailsPage';
import EditEnquiryPage from '../features/front-office/pages/enquiries/EditEnquiryPage';
import AppointmentsPage from '../features/front-office/pages/appointments/AppointmentsPage';
import CreateAppointmentPage from '../features/front-office/pages/appointments/CreateAppointmentPage';
import AppointmentDetailsPage from '../features/front-office/pages/appointments/AppointmentDetailsPage';
import EditAppointmentPage from '../features/front-office/pages/appointments/EditAppointmentPage';
import AppointmentCalendarPage from '../features/front-office/pages/appointments/AppointmentCalendarPage';
import ComplaintsPage from '../features/front-office/pages/complaints/ComplaintsPage';
import CreateComplaintPage from '../features/front-office/pages/complaints/CreateComplaintPage';
import ComplaintDetailsPage from '../features/front-office/pages/complaints/ComplaintDetailsPage';
import EditComplaintPage from '../features/front-office/pages/complaints/EditComplaintPage';
// Sales & Purchase Routes
import ItemCategoriesPage from '../features/sales-purchase/pages/item-categories/ItemCategoriesPage';
import CreateItemCategoryPage from '../features/sales-purchase/pages/item-categories/CreateItemCategoryPage';
import ItemCategoryDetailsPage from '../features/sales-purchase/pages/item-categories/ItemCategoryDetailsPage';
import EditItemCategoryPage from '../features/sales-purchase/pages/item-categories/EditItemCategoryPage';
import UOMPage from '../features/sales-purchase/pages/uom/UOMPage';
import CreateUOMPage from '../features/sales-purchase/pages/uom/CreateUOMPage';
import UOMDetailsPage from '../features/sales-purchase/pages/uom/UOMDetailsPage';
import EditUOMPage from '../features/sales-purchase/pages/uom/EditUOMPage';
import TaxCodesPage from '../features/sales-purchase/pages/tax-codes/TaxCodesPage';
import CreateTaxCodePage from '../features/sales-purchase/pages/tax-codes/CreateTaxCodePage';
import TaxCodeDetailsPage from '../features/sales-purchase/pages/tax-codes/TaxCodeDetailsPage';
import EditTaxCodePage from '../features/sales-purchase/pages/tax-codes/EditTaxCodePage';
import PaymentTermsPage from '../features/sales-purchase/pages/payment-terms/PaymentTermsPage';
import CreatePaymentTermPage from '../features/sales-purchase/pages/payment-terms/CreatePaymentTermPage';
import PaymentTermDetailsPage from '../features/sales-purchase/pages/payment-terms/PaymentTermDetailsPage';
import EditPaymentTermPage from '../features/sales-purchase/pages/payment-terms/EditPaymentTermPage';
import WarehousesPage from '../features/sales-purchase/pages/warehouses/WarehousesPage';
import CreateWarehousePage from '../features/sales-purchase/pages/warehouses/CreateWarehousePage';
import WarehouseDetailsPage from '../features/sales-purchase/pages/warehouses/WarehouseDetailsPage';
import EditWarehousePage from '../features/sales-purchase/pages/warehouses/EditWarehousePage';
import ItemsPage from '../features/sales-purchase/pages/items/ItemsPage';
import CreateItemPage from '../features/sales-purchase/pages/items/CreateItemPage';
import ItemDetailsPage from '../features/sales-purchase/pages/items/ItemDetailsPage';
import EditItemPage from '../features/sales-purchase/pages/items/EditItemPage';
import VendorsPage from '../features/sales-purchase/pages/vendors/VendorsPage';
import CreateVendorPage from '../features/sales-purchase/pages/vendors/CreateVendorPage';
import VendorDetailsPage from '../features/sales-purchase/pages/vendors/VendorDetailsPage';
import EditVendorPage from '../features/sales-purchase/pages/vendors/EditVendorPage';
import CustomersPage from '../features/sales-purchase/pages/customers/CustomersPage';
import CreateCustomerPage from '../features/sales-purchase/pages/customers/CreateCustomerPage';
import CustomerDetailsPage from '../features/sales-purchase/pages/customers/CustomerDetailsPage';
import EditCustomerPage from '../features/sales-purchase/pages/customers/EditCustomerPage';
import PurchaseOrdersPage from '../features/sales-purchase/pages/purchase-orders/PurchaseOrdersPage';
import CreatePurchaseOrderPage from '../features/sales-purchase/pages/purchase-orders/CreatePurchaseOrderPage';
import PurchaseOrderDetailsPage from '../features/sales-purchase/pages/purchase-orders/PurchaseOrderDetailsPage';
import EditPurchaseOrderPage from '../features/sales-purchase/pages/purchase-orders/EditPurchaseOrderPage';
import GRNsPage from '../features/sales-purchase/pages/grn/GRNsPage';
import CreateGRNPage from '../features/sales-purchase/pages/grn/CreateGRNPage';
import GRNDetailsPage from '../features/sales-purchase/pages/grn/GRNDetailsPage';
import EditGRNPage from '../features/sales-purchase/pages/grn/EditGRNPage';
import InvoicesPage from '../features/sales-purchase/pages/invoices/InvoicesPage';
import CreateInvoicePage from '../features/sales-purchase/pages/invoices/CreateInvoicePage';
import InvoiceDetailsPage from '../features/sales-purchase/pages/invoices/InvoiceDetailsPage';
import EditInvoicePage from '../features/sales-purchase/pages/invoices/EditInvoicePage';
import PaymentsPage from '../features/sales-purchase/pages/payments/PaymentsPage';
import CreatePaymentPage from '../features/sales-purchase/pages/payments/CreatePaymentPage';
import PaymentDetailsPage from '../features/sales-purchase/pages/payments/PaymentDetailsPage';
import EditPaymentPage from '../features/sales-purchase/pages/payments/EditPaymentPage';
// Sales Orders & Sales Invoices
import SalesOrdersPage from '../features/sales-purchase/pages/sales-orders/SalesOrdersPage';
import CreateSalesOrderPage from '../features/sales-purchase/pages/sales-orders/CreateSalesOrderPage';
import SalesOrderDetailsPage from '../features/sales-purchase/pages/sales-orders/SalesOrderDetailsPage';
import EditSalesOrderPage from '../features/sales-purchase/pages/sales-orders/EditSalesOrderPage';
import SalesInvoicesPage from '../features/sales-purchase/pages/sales-invoices/SalesInvoicesPage';
import CreateSalesInvoicePage from '../features/sales-purchase/pages/sales-invoices/CreateSalesInvoicePage';
import SalesInvoiceDetailsPage from '../features/sales-purchase/pages/sales-invoices/SalesInvoiceDetailsPage';
import EditSalesInvoicePage from '../features/sales-purchase/pages/sales-invoices/EditSalesInvoicePage';
// Sales Receipts
import SalesReceiptsPage from '../features/sales-purchase/pages/sales-receipts/SalesReceiptsPage';
import CreateSalesReceiptPage from '../features/sales-purchase/pages/sales-receipts/CreateSalesReceiptPage';
import SalesReceiptDetailsPage from '../features/sales-purchase/pages/sales-receipts/SalesReceiptDetailsPage';
import EditSalesReceiptPage from '../features/sales-purchase/pages/sales-receipts/EditSalesReceiptPage';
// Reports
import PurchaseRegisterPage from '../features/sales-purchase/pages/reports/PurchaseRegisterPage';
import SalesRegisterPage from '../features/sales-purchase/pages/reports/SalesRegisterPage';
// RBAC
import RolesPage from '../features/sales-purchase/pages/rbac/RolesPage';
import CreateRolePage from '../features/sales-purchase/pages/rbac/CreateRolePage';
import EditRolePage from '../features/sales-purchase/pages/rbac/EditRolePage';
import PermissionsPage from '../features/sales-purchase/pages/rbac/PermissionsPage';
import CreatePermissionPage from '../features/sales-purchase/pages/rbac/CreatePermissionPage';
import EditPermissionPage from '../features/sales-purchase/pages/rbac/EditPermissionPage';
import UsersPage from '../features/sales-purchase/pages/rbac/UsersPage';
import CreateUserPage from '../features/sales-purchase/pages/rbac/CreateUserPage';
import EditUserPage from '../features/sales-purchase/pages/rbac/EditUserPage';
// Canteen RBAC
import CanteenRolesPage from '../features/canteen/pages/rbac/RolesPage';
import CanteenCreateRolePage from '../features/canteen/pages/rbac/CreateRolePage';
import CanteenEditRolePage from '../features/canteen/pages/rbac/EditRolePage';
import CanteenPermissionsPage from '../features/canteen/pages/rbac/PermissionsPage';
import CanteenCreatePermissionPage from '../features/canteen/pages/rbac/CreatePermissionPage';
import CanteenEditPermissionPage from '../features/canteen/pages/rbac/EditPermissionPage';
import CanteenUsersPage from '../features/canteen/pages/rbac/UsersPage';
import CanteenCreateUserPage from '../features/canteen/pages/rbac/CreateUserPage';
import CanteenEditUserPage from '../features/canteen/pages/rbac/EditUserPage';
// Canteen Menu
import MenuCategoriesPage from '../features/canteen/pages/menu/MenuCategoriesPage';
import CreateMenuCategoryPage from '../features/canteen/pages/menu/CreateMenuCategoryPage';
import EditMenuCategoryPage from '../features/canteen/pages/menu/EditMenuCategoryPage';
import MenuItemsPage from '../features/canteen/pages/menu/MenuItemsPage';
import CreateMenuItemPage from '../features/canteen/pages/menu/CreateMenuItemPage';
import EditMenuItemPage from '../features/canteen/pages/menu/EditMenuItemPage';
import MenuSchedulesPage from '../features/canteen/pages/menu/MenuSchedulesPage';
import CreateMenuSchedulePage from '../features/canteen/pages/menu/CreateMenuSchedulePage';
import EditMenuSchedulePage from '../features/canteen/pages/menu/EditMenuSchedulePage';
// Canteen Members
import MembersPage from '../features/canteen/pages/members/MembersPage';
import CreateMemberPage from '../features/canteen/pages/members/CreateMemberPage';
import EditMemberPage from '../features/canteen/pages/members/EditMemberPage';
import MemberLookupPage from '../features/canteen/pages/members/MemberLookupPage';
// Canteen POS
import PosTerminalsPage from '../features/canteen/pages/pos/PosTerminalsPage';
import CreatePosTerminalPage from '../features/canteen/pages/pos/CreatePosTerminalPage';
import EditPosTerminalPage from '../features/canteen/pages/pos/EditPosTerminalPage';
import ShiftsPage from '../features/canteen/pages/pos/ShiftsPage';
import OpenShiftPage from '../features/canteen/pages/pos/OpenShiftPage';
import ViewShiftPage from '../features/canteen/pages/pos/ViewShiftPage';
// Canteen Orders
import OrdersPage from '../features/canteen/pages/orders/OrdersPage';
import CreateOrderPage from '../features/canteen/pages/orders/CreateOrderPage';
import OrderDetailsPage from '../features/canteen/pages/orders/OrderDetailsPage';
import EditOrderPage from '../features/canteen/pages/orders/EditOrderPage';
// Canteen Payments
import OrderPaymentsPage from '../features/canteen/pages/payments/OrderPaymentsPage';
// Canteen Wallet
import WalletPage from '../features/canteen/pages/wallet/WalletPage';
import WalletTopupsPage from '../features/canteen/pages/wallet/WalletTopupsPage';
import WalletTransactionsPage from '../features/canteen/pages/wallet/WalletTransactionsPage';
import WalletsPage from '../features/canteen/pages/wallet/WalletsPage';
// Canteen Reports
import CanteenReportsPage from '../features/canteen/pages/reports/CanteenReportsPage';

export const routeConfig = [
  {
    path: ROUTES.LOGIN,
    element: LoginPage,
    isPublic: true,
  },
  {
    path: ROUTES.DASHBOARD,
    element: DashboardPage,
    isProtected: true,
  },
  
  // Front Office Routes
  {
    path: '/front-office',
    element: FrontOfficeDashboardPage,
    isProtected: true,
  },
  {
    path: '/front-office/visitors',
    element: VisitorsPage,
    isProtected: true,
  },
  {
    path: '/front-office/visitors/new',
    element: CreateVisitorPage,
    isProtected: true,
  },
  {
    path: '/front-office/visitors/:id',
    element: VisitorDetailsPage,
    isProtected: true,
  },
  {
    path: '/front-office/visitors/:id/edit',
    element: EditVisitorPage,
    isProtected: true,
  },
  {
    path: '/front-office/enquiries',
    element: EnquiriesPage,
    isProtected: true,
  },
  {
    path: '/front-office/enquiries/new',
    element: CreateEnquiryPage,
    isProtected: true,
  },
  {
    path: '/front-office/enquiries/:id',
    element: EnquiryDetailsPage,
    isProtected: true,
  },
  {
    path: '/front-office/enquiries/:id/edit',
    element: EditEnquiryPage,
    isProtected: true,
  },
  {
    path: '/front-office/appointments',
    element: AppointmentsPage,
    isProtected: true,
  },
  {
    path: '/front-office/appointments/new',
    element: CreateAppointmentPage,
    isProtected: true,
  },
  {
    path: '/front-office/appointments/:id',
    element: AppointmentDetailsPage,
    isProtected: true,
  },
  {
    path: '/front-office/appointments/:id/edit',
    element: EditAppointmentPage,
    isProtected: true,
  },
  {
    path: '/front-office/appointments/calendar',
    element: AppointmentCalendarPage,
    isProtected: true,
  },
  {
    path: '/front-office/complaints',
    element: ComplaintsPage,
    isProtected: true,
  },
  {
    path: '/front-office/complaints/new',
    element: CreateComplaintPage,
    isProtected: true,
  },
  {
    path: '/front-office/complaints/:id',
    element: ComplaintDetailsPage,
    isProtected: true,
  },
  {
    path: '/front-office/complaints/:id/edit',
    element: EditComplaintPage,
    isProtected: true,
  },
  
  // Sales & Purchase Routes
  {
    path: '/sales-purchase/item-categories',
    element: ItemCategoriesPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/item-categories/new',
    element: CreateItemCategoryPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/item-categories/:id',
    element: ItemCategoryDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/item-categories/:id/edit',
    element: EditItemCategoryPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/uom',
    element: UOMPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/uom/new',
    element: CreateUOMPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/uom/:id',
    element: UOMDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/uom/:id/edit',
    element: EditUOMPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/tax-codes',
    element: TaxCodesPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/tax-codes/new',
    element: CreateTaxCodePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/tax-codes/:id',
    element: TaxCodeDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/tax-codes/:id/edit',
    element: EditTaxCodePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payment-terms',
    element: PaymentTermsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payment-terms/new',
    element: CreatePaymentTermPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payment-terms/:id',
    element: PaymentTermDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payment-terms/:id/edit',
    element: EditPaymentTermPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/warehouses',
    element: WarehousesPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/warehouses/new',
    element: CreateWarehousePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/warehouses/:id',
    element: WarehouseDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/warehouses/:id/edit',
    element: EditWarehousePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/items',
    element: ItemsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/items/new',
    element: CreateItemPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/items/:id',
    element: ItemDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/items/:id/edit',
    element: EditItemPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/vendors',
    element: VendorsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/vendors/new',
    element: CreateVendorPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/vendors/:id',
    element: VendorDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/vendors/:id/edit',
    element: EditVendorPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/customers',
    element: CustomersPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/customers/new',
    element: CreateCustomerPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/customers/:id',
    element: CustomerDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/customers/:id/edit',
    element: EditCustomerPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/purchase-orders',
    element: PurchaseOrdersPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/purchase-orders/new',
    element: CreatePurchaseOrderPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/purchase-orders/:id',
    element: PurchaseOrderDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/purchase-orders/:id/edit',
    element: EditPurchaseOrderPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/grn',
    element: GRNsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/grn/new',
    element: CreateGRNPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/grn/:id',
    element: GRNDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/grn/:id/edit',
    element: EditGRNPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/invoices',
    element: InvoicesPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/invoices/new',
    element: CreateInvoicePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/invoices/:id',
    element: InvoiceDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/invoices/:id/edit',
    element: EditInvoicePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payments',
    element: PaymentsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payments/new',
    element: CreatePaymentPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payments/:id',
    element: PaymentDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/payments/:id/edit',
    element: EditPaymentPage,
    isProtected: true,
  },
  // Sales Orders
  {
    path: '/sales-purchase/sales-orders',
    element: SalesOrdersPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-orders/new',
    element: CreateSalesOrderPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-orders/:id',
    element: SalesOrderDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-orders/:id/edit',
    element: EditSalesOrderPage,
    isProtected: true,
  },
  // Sales Invoices
  {
    path: '/sales-purchase/sales-invoices',
    element: SalesInvoicesPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-invoices/new',
    element: CreateSalesInvoicePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-invoices/:id',
    element: SalesInvoiceDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-invoices/:id/edit',
    element: EditSalesInvoicePage,
    isProtected: true,
  },
  // Sales Receipts
  {
    path: '/sales-purchase/sales-receipts',
    element: SalesReceiptsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-receipts/new',
    element: CreateSalesReceiptPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-receipts/:id',
    element: SalesReceiptDetailsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-receipts/:id/edit',
    element: EditSalesReceiptPage,
    isProtected: true,
  },
  // Reports
  {
    path: '/sales-purchase/purchase-register',
    element: PurchaseRegisterPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/sales-register',
    element: SalesRegisterPage,
    isProtected: true,
  },
  // RBAC
  {
    path: '/sales-purchase/roles',
    element: RolesPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/roles/new',
    element: CreateRolePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/roles/:id/edit',
    element: EditRolePage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/permissions',
    element: PermissionsPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/permissions/new',
    element: CreatePermissionPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/permissions/:id/edit',
    element: EditPermissionPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/users',
    element: UsersPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/users/new',
    element: CreateUserPage,
    isProtected: true,
  },
  {
    path: '/sales-purchase/users/:id/edit',
    element: EditUserPage,
    isProtected: true,
  },
  
  // Canteen RBAC Routes
  {
    path: '/canteen/roles',
    element: CanteenRolesPage,
    isProtected: true,
  },
  {
    path: '/canteen/roles/new',
    element: CanteenCreateRolePage,
    isProtected: true,
  },
  {
    path: '/canteen/roles/:id/edit',
    element: CanteenEditRolePage,
    isProtected: true,
  },
  {
    path: '/canteen/permissions',
    element: CanteenPermissionsPage,
    isProtected: true,
  },
  {
    path: '/canteen/permissions/new',
    element: CanteenCreatePermissionPage,
    isProtected: true,
  },
  {
    path: '/canteen/permissions/:id/edit',
    element: CanteenEditPermissionPage,
    isProtected: true,
  },
  {
    path: '/canteen/users',
    element: CanteenUsersPage,
    isProtected: true,
  },
  {
    path: '/canteen/users/new',
    element: CanteenCreateUserPage,
    isProtected: true,
  },
  {
    path: '/canteen/users/:id/edit',
    element: CanteenEditUserPage,
    isProtected: true,
  },
  
  // Canteen Members Routes
  {
    path: '/canteen/members',
    element: MembersPage,
    isProtected: true,
  },
  {
    path: '/canteen/members/new',
    element: CreateMemberPage,
    isProtected: true,
  },
  {
    path: '/canteen/members/:id/edit',
    element: EditMemberPage,
    isProtected: true,
  },
  {
    path: '/canteen/members/lookup',
    element: MemberLookupPage,
    isProtected: true,
  },
  
  // Canteen POS Routes
  {
    path: '/canteen/pos/terminals',
    element: PosTerminalsPage,
    isProtected: true,
  },
  {
    path: '/canteen/pos/terminals/new',
    element: CreatePosTerminalPage,
    isProtected: true,
  },
  {
    path: '/canteen/pos/terminals/:id/edit',
    element: EditPosTerminalPage,
    isProtected: true,
  },
  {
    path: '/canteen/pos/shifts',
    element: ShiftsPage,
    isProtected: true,
  },
  {
    path: '/canteen/pos/shifts/open',
    element: OpenShiftPage,
    isProtected: true,
  },
  {
    path: '/canteen/pos/shifts/:id',
    element: ViewShiftPage,
    isProtected: true,
  },
  
  // Canteen Orders Routes
  {
    path: '/canteen/orders',
    element: OrdersPage,
    isProtected: true,
  },
  {
    path: '/canteen/orders/new',
    element: CreateOrderPage,
    isProtected: true,
  },
  {
    path: '/canteen/orders/:id',
    element: OrderDetailsPage,
    isProtected: true,
  },
  {
    path: '/canteen/orders/:id/edit',
    element: EditOrderPage,
    isProtected: true,
  },
  // Canteen Payments Routes
  {
    path: '/canteen/orders/:orderId/payments',
    element: OrderPaymentsPage,
    isProtected: true,
  },

  // Canteen Wallet Routes
  {
    path: '/canteen/wallets',
    element: WalletsPage,
    isProtected: true,
  },
  {
    path: '/canteen/members/:memberId/wallet',
    element: WalletPage,
    isProtected: true,
  },
  {
    path: '/canteen/wallets/:walletId/topups',
    element: WalletTopupsPage,
    isProtected: true,
  },
  {
    path: '/canteen/wallets/:walletId/transactions',
    element: WalletTransactionsPage,
    isProtected: true,
  },

  // Canteen Reports Routes
  {
    path: '/canteen/reports',
    element: CanteenReportsPage,
    isProtected: true,
  },
  
  // Canteen Menu Routes
  {
    path: '/canteen/menu/categories',
    element: MenuCategoriesPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/categories/new',
    element: CreateMenuCategoryPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/categories/:id/edit',
    element: EditMenuCategoryPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/items',
    element: MenuItemsPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/items/new',
    element: CreateMenuItemPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/items/:id/edit',
    element: EditMenuItemPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/schedules',
    element: MenuSchedulesPage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/schedules/new',
    element: CreateMenuSchedulePage,
    isProtected: true,
  },
  {
    path: '/canteen/menu/schedules/:id/edit',
    element: EditMenuSchedulePage,
    isProtected: true,
  },
  
  // Future routes will be added here
  // {
  //   path: ROUTES.STUDENTS,
  //   element: StudentsPage,
  //   isProtected: true,
  // },
];
