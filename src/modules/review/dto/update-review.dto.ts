// review/dto/update-review.dto.ts
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stars?: number;
}