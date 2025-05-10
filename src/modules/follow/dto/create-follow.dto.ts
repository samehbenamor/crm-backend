import { IsString, IsBoolean } from 'class-validator';

export class CreateFollowDto {
  @IsString()
  businessId: string;

  @IsBoolean()
  notificationsEnabled: boolean;
}
