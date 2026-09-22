// Campaigns
export interface Campaign {
  campaign_id: number;
  title: string;
  description?: string | null;
  goal_amount: number;
  start_date: string;
  end_date: string;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignFormData {
  title: string;
  description: string;
  goal_amount: string;
  start_date: string;
  end_date: string;
}

// Donations
export interface DonationFormData {
  alumni_id: string;
  campaign_id: string;
  amount: string;
  payment_mode: string;
  transaction_ref: string;
  is_anonymous: boolean;
  notes: string;
  mark_received: boolean;
  received_on: string;
}

export interface DonationConfirmPayload {
  transaction_ref: string;
  payment_mode: string;
  received_on: string;
}
