export interface KioskAppointmentLookup {
  appointment_id: number;
  visitor_name: string;
  host_name: string;
  department: string;
  appointment_date: string;
  start_time: string;
  purpose?: string;
  status: string;
  can_check_in: boolean;
}

export interface KioskCheckInResult {
  badge_number: string;
  host_name: string;
  check_in_time: string;
  status: string;
}
