import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  pointsCost: number;
}