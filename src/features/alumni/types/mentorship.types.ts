// Mentorship programs
export interface MentorshipProgram {
  program_id: number;
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MentorshipProgramFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

// A mentee is either an existing alumni profile, or someone not in the
// directory yet (identified by student reference + name only).
export interface MatchCreatePayload {
  mentor_id: number;
  mentee_alumni_id?: number;
  mentee_student_ref?: string;
  mentee_name?: string;
  matched_date: string;
}

// Mentors
export interface Mentor {
  mentor_id: number;
  alumni_id: number;
  expertise_areas: string[];
  max_mentees: number;
  bio?: string | null;
  availability_note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MentorFormData {
  alumni_id: string;
  expertise_areas: string;
  max_mentees: string;
  bio: string;
  availability_note: string;
}

// Mentorship matches
export interface MatchUpdateData {
  status: string;
  reason: string;
}
