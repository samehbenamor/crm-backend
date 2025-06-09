import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class EarnPointsDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsNumber()
  @IsPositive()
  points: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  expiresInDays?: number;
}