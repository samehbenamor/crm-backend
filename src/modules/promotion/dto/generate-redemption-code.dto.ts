// promotion/dto/generate-redemption-code.dto.ts
import { IsUUID } from 'class-validator';
export class GenerateRedemptionCodeDto {
  @IsUUID()
  promotionId: string;
  @IsUUID()
  clientId: string;
}
// promotion/dto/redeem-code.dto.ts
export class RedeemCodeDto {
  @IsUUID()
  code: string;
  @IsUUID()
  businessOwnerId: string; // Add this field
}
