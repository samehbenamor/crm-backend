import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsObject()
  @IsOptional()
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverPhotoUrl?: string;

  @IsBoolean()
  isVerified: boolean;
}
