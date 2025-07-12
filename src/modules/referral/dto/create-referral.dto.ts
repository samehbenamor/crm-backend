// referral/dto/create-referral.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReferralDto {
  @IsString()
  @IsNotEmpty()
  referrerClientId: string; // Changed from referrerId

  @IsString()
  @IsNotEmpty()
  businessId: string;
}