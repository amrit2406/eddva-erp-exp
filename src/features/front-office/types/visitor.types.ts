// Visitor types

export type VisitorStatus = 'checked_in' | 'checked_out';

export type IDProofType = 'aadhaar' | 'pan' | 'passport' | 'driving_license' | 'voter_id' | 'other';

export interface Visitor {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  idProofType?: IDProofType;
  idProofNumber?: string;
  photo?: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorLog {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorPhone: string;
  hostEmployeeId: string;
  hostEmployeeName?: string;
  appointmentId?: string;
  purpose: string;
  badgeNumber: string;
  checkInTime: string;
  checkOutTime?: string;
  status: VisitorStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorCheckIn {
  visitorId: string;
  hostEmployeeId: string;
  appointmentId?: string;
  purpose: string;
  badgeNumber: string;
  checkInTime: string;
}

export interface VisitorCheckOut {
  visitorLogId: string;
  checkOutTime: string;
}
