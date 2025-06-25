import { IsString, IsBoolean } from 'class-validator';

export class CreateFollowDto {
  @IsString()
  clientId: string; // Add this line
  
  @IsString()
  businessId: string;

  @IsBoolean()
  notificationsEnabled: boolean;
}