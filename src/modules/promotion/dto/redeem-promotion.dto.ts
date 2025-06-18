import { IsString, IsNotEmpty } from 'class-validator';

export class RedeemPromotionDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  promotionId: string;
}