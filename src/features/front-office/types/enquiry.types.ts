// Enquiry types

export type EnquirySource = 'walk_in' | 'phone' | 'email' | 'website';

export type EnquiryStatus = 'open' | 'in_progress' | 'closed';

export type EnquiryCategory = 'admission' | 'sales' | 'general' | 'support' | 'other';

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  enquirerName: string;
  phone: string;
  email?: string;
  source: EnquirySource;
  category: EnquiryCategory;
  description: string;
  notes?: string;
  nextFollowUpDate?: string;
  assignedToId?: string;
  assignedToName?: string;
  status: EnquiryStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFollowup {
  id: string;
  enquiryId: string;
  notes: string;
  followupDate: string;
  nextFollowupDate?: string;
  updatedBy: string;
  updatedAt: string;
}
