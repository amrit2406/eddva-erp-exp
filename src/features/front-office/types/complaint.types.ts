// Complaint types

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ComplaintCategory = 'facility' | 'staff' | 'service' | 'billing' | 'other';

export interface Complaint {
  id: string;
  complaintNumber: string;
  complainantName: string;
  phone: string;
  email?: string;
  category: ComplaintCategory;
  subject?: string;
  description: string;
  priority: ComplaintPriority;
  assignedToId?: string;
  assignedToName?: string;
  status: ComplaintStatus;
  resolution?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  notes: string;
  statusChange?: ComplaintStatus;
  oldStatus?: ComplaintStatus;
  updatedBy: string;
  updatedAt: string;
}
