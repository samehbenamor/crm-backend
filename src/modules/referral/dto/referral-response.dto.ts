// referral/dto/referral-response.dto.ts
import { IsString, IsDate, IsBoolean } from 'class-validator';

export class ReferralResponseDto {
  @IsString()
  id: string;

  @IsString()
  referrerId: string;

  @IsString()
  refereeId: string; // The person who was referred

  @IsString()
  businessId: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  isCompleted: boolean; // Whether the referral was completed (user followed business)
}