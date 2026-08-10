// Appointment types

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  visitorId?: string;
  visitorName?: string;
  visitorPhone?: string;
  hostEmployeeId: string;
  hostEmployeeName?: string;
  departmentId: string;
  departmentName?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: AppointmentStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAvailability {
  employeeId: string;
  date: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
