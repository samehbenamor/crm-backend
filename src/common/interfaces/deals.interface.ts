export interface Deal {
  id: string; // UUID
  name: string;
  description?: string;
  amount: number;
  currency: string;
  expected_close_date?: Date;
  actual_close_date?: Date;
  stage: 'prospect' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100%
  company_id: string;
  contact_id?: string;
  owner_id: string; // User ID
  created_at: Date;
  updated_at: Date;
}