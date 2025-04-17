export interface Contact {
  id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_id?: string; // Reference to companies
  job_title?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  created_by: string; // User ID
  created_at: Date;
  updated_at: Date;
}