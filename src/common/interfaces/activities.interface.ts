export interface Activity {
  id: string; // UUID
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description?: string;
  due_date?: Date;
  completed: boolean;
  completed_at?: Date;
  related_to: 'contact' | 'company' | 'deal'; // Polymorphic relation
  related_id: string;
  owner_id: string; // User ID
  created_at: Date;
  updated_at: Date;
}