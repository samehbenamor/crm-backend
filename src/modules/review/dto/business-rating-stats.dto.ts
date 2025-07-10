export class BusinessRatingStatsDto {
  averageRating: number;
  totalReviews: number;
  starCounts: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}