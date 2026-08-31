// Appointment constants

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
] as const;

export const APPOINTMENT_STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-orange-100 text-orange-700',
};

export const APPOINTMENT_QUERY_KEY = ['front-office', 'appointments'] as const;
export const EMPLOYEE_AVAILABILITY_QUERY_KEY = ['front-office', 'employee-availability'] as const;
