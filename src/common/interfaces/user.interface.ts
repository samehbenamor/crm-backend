

export interface User {
  id: string;
  email: string;
  aud?: string;
  role?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    username?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}
