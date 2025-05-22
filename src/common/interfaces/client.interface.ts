// interfaces/client.interface.ts
export interface Client {
  userId: string; // references User.id
  firstName: string;
  lastName: string;
  phoneNumber: string;
  referralCode?: string;
  displayName: string;
  interests: string[];
  location?: string;
  followingCount?: number;
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}