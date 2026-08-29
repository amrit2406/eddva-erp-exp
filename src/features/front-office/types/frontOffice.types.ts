// Shared Front Office types and exports

export * from './visitor.types';
export * from './enquiry.types';
export * from './appointment.types';
export * from './complaint.types';
export * from './employee.types';
export * from './department.types';
export * from './attachment.types';
export * from './rbac.types';
export * from './notification.types';
export * from './departmentRecord.types';
export * from './employeeRecord.types';
export * from './visitorRecord.types';
export * from './visitorLog.types';
export * from './kiosk.types';

// Common pagination params
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common filter params
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}
