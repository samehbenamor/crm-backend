import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class SpendPointsDto {
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
}