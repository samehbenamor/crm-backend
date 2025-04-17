export interface Company {
  id: string; // UUID
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  annual_revenue?: number;
  employee_count?: number;
  notes?: string;
  created_by: string; // User ID
  created_at: Date;
  updated_at: Date;
}