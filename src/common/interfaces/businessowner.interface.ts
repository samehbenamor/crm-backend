export interface BusinessOwner {
  userId: string; // references User.id
  displayName: string;
  phoneNumber?: string;
  businessCount: number;
  bio?: string;
  website?: string;
  createdAt: string;
  updatedAt?: string;
}
