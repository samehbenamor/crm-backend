// review/dto/create-review.dto.ts
import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;
}