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
  
  // Future routes will be added here
  // {
  //   path: ROUTES.STUDENTS,
  //   element: StudentsPage,
  //   isProtected: true,
  // },
];
