import { IsString, IsOptional, IsUrl, IsNumber } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsOptional()
  annual_revenue?: number;

  @IsNumber()
  @IsOptional()
  employee_count?: number;

  @IsString()
  @IsOptional()
  notes?: string;
} 