import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitOnboardingDto {
  @IsArray()
  @IsString({ each: true })
  appUsage: string[];

  @IsString()
  @IsNotEmpty()
  discovery: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  interests: string[];

  @IsString()
  @IsOptional()
  customDiscovery?: string;
}