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
  // Future routes will be added here
  // {
  //   path: ROUTES.STUDENTS,
  //   element: StudentsPage,
  //   isProtected: true,
  // },
];
