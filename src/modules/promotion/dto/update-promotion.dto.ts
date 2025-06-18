import { IsString, IsOptional, IsNumber, IsPositive, IsBoolean } from 'class-validator';

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  pointsCost?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}