export interface TargetSegment {
  all: boolean;
  batch_years: number[];
  graduation_years: number[];
  programs: string[];
  cities: string[];
  countries: string[];
  industries: string[];
  companies: string[];
  group_ids: number[];
}

export const EMPTY_SEGMENT: TargetSegment = {
  all: false,
  batch_years: [],
  graduation_years: [],
  programs: [],
  cities: [],
  countries: [],
  industries: [],
  companies: [],
  group_ids: [],
};

export interface Newsletter {
  newsletter_id: number;
  title: string;
  content: string;
  target_segment: TargetSegment;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterFormData {
  title: string;
  content: string;
  target_segment: TargetSegment;
}
