// Job board
export interface JobPosting {
  job_id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: string;
  industry: string;
  expiry_date: string;
  posted_by_alumni_id?: number;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobFormData {
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: string;
  industry: string;
  expiry_date: string;
  posted_by_alumni_id: string;
}

export interface JobApplicationPayload {
  resume_url: string;
  cover_note: string;
  alumni_id: number;
}

// Job applications (the response shape isn't documented, so callers mostly
// treat these generically — see GenericRecord in profile.types.ts).
export interface JobApplicationUpdateData {
  status: string;
  notes?: string;
}
