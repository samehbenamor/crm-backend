export interface Client {
  userId: string; // references User.id
  displayName: string;
  interests: string[]; // e.g., ['fitness', 'tech', 'restaurants']
  location?: string;
  followingCount: number;
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}
