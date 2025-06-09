// interfaces/client.interface.ts
import { PointsWallet } from './fidelity.interface';
export interface Client {
  userId: string; // references User.id
  firstName: string;
  lastName: string;
  phoneNumber: string;
  referralCode?: string;
  displayName: string;
  interests: string[];
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  followingCount?: number;
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  pointsWallets?: PointsWallet[]; // Add this line
  createdAt: string;
  updatedAt?: string;
}