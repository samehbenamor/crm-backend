export interface Post {
  id: string;
  businessId: string; // references Business.id
  content: string;
  imageUrls?: string[]; // allow multiple media items
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
}
