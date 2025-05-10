export interface Business {
  id: string;
  ownerId: string; // references User.id (business owner)
  name: string;
  description: string;
  category: string; // e.g., "Restaurant", "Fitness", "Retail"
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  logoUrl?: string;
  coverPhotoUrl?: string;
  isVerified: boolean;
  followersCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt?: string;
}
