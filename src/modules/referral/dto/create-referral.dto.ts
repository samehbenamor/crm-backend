// referral/dto/create-referral.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReferralDto {
  @IsString()
  @IsNotEmpty()
  businessId: string; // Only businessId needed now
}