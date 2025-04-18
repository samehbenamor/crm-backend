// src/deals/dto/create-deal.dto.ts
import { 
  IsString, IsOptional, IsNumber, IsDate, IsIn, IsNotEmpty, Min, Max 
} from 'class-validator';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsDate()
  @IsOptional()
  expected_close_date?: Date;

  @IsDate()
  @IsOptional()
  actual_close_date?: Date;

  @IsIn(['prospect', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
  stage: 'prospect' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number;

  @IsString()
  @IsNotEmpty()
  company_id: string;

  @IsString()
  @IsOptional()
  contact_id?: string;

  // Add owner_id to the DTO (optional since we'll get it from the user decorator)
  @IsString()
  @IsOptional()
  owner_id?: string;
}