// Appointment constants

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
] as const;

export const APPOINTMENT_QUERY_KEY = ['front-office', 'appointments'] as const;
export const EMPLOYEE_AVAILABILITY_QUERY_KEY = ['front-office', 'employee-availability'] as const;
