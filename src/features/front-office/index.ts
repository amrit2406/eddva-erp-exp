// Front Office Management Module
// Exports are organized by sub-module

// Pages
export { default as FrontOfficeDashboardPage } from './pages/FrontOfficeDashboardPage';

// Visitors
export { default as VisitorsPage } from './pages/visitors/VisitorsPage';
export { default as CreateVisitorPage } from './pages/visitors/CreateVisitorPage';
export { default as VisitorDetailsPage } from './pages/visitors/VisitorDetailsPage';
export { default as EditVisitorPage } from './pages/visitors/EditVisitorPage';

// Enquiries
export { default as EnquiriesPage } from './pages/enquiries/EnquiriesPage';
export { default as CreateEnquiryPage } from './pages/enquiries/CreateEnquiryPage';
export { default as EnquiryDetailsPage } from './pages/enquiries/EnquiryDetailsPage';
export { default as EditEnquiryPage } from './pages/enquiries/EditEnquiryPage';

// Appointments
export { default as AppointmentsPage } from './pages/appointments/AppointmentsPage';
export { default as CreateAppointmentPage } from './pages/appointments/CreateAppointmentPage';
export { default as AppointmentDetailsPage } from './pages/appointments/AppointmentDetailsPage';
export { default as EditAppointmentPage } from './pages/appointments/EditAppointmentPage';
export { default as AppointmentCalendarPage } from './pages/appointments/AppointmentCalendarPage';

// Complaints
export { default as ComplaintsPage } from './pages/complaints/ComplaintsPage';
export { default as CreateComplaintPage } from './pages/complaints/CreateComplaintPage';
export { default as ComplaintDetailsPage } from './pages/complaints/ComplaintDetailsPage';
export { default as EditComplaintPage } from './pages/complaints/EditComplaintPage';

// Common Components
export { default as StatusBadge } from './components/common/StatusBadge';
export { default as PriorityBadge } from './components/common/PriorityBadge';
export { default as PersonInfo } from './components/common/PersonInfo';
export { default as ActivityTimeline } from './components/common/ActivityTimeline';
export { default as RecordDetails } from './components/common/RecordDetails';

// Types
export * from './types/visitor.types';
export * from './types/enquiry.types';
export * from './types/appointment.types';
export * from './types/complaint.types';
export * from './types/employee.types';
export * from './types/department.types';
export * from './types/attachment.types';
export * from './types/frontOffice.types';

// Constants
export * from './constants/visitor.constants';
export * from './constants/enquiry.constants';
export * from './constants/appointment.constants';
export * from './constants/complaint.constants';

// Mock Data
export * from './mock/visitors.mock';
export * from './mock/enquiries.mock';
export * from './mock/appointments.mock';
export * from './mock/complaints.mock';
export * from './mock/employees.mock';
export * from './mock/departments.mock';
