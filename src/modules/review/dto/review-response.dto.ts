// review/dto/review-response.dto.ts
export class ReviewResponseDto {
  id: string;
  clientId: string;
  businessId: string;
  description: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    displayName: string;
  };
}