// create-client.dto.ts
import { IsString, IsOptional, IsNotEmpty, IsArray, IsBoolean, IsPhoneNumber } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

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