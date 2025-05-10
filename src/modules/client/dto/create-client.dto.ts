import { IsString, IsOptional, IsNotEmpty, IsArray, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsArray()
  @IsOptional()
  interests?: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  notificationPreferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
}
