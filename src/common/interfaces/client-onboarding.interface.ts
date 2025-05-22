export interface ClientOnboarding {
  id: string;
  userId: string;  // Supabase user ID
  appUsage: string[];
  discovery: string;
  interests: string[];
  customDiscovery?: string;
  createdAt: string;
  updatedAt?: string;
}