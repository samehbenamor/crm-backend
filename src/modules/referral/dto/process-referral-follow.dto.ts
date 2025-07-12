// referral/dto/process-referral-follow.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessReferralFollowDto {
  @IsString()
  @IsNotEmpty()
  refereeClientId: string; // Changed from refereeId

  @IsString()
  @IsNotEmpty()
  businessId: string;
}