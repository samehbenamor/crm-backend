import { 
  IsString, IsOptional, IsBoolean, IsDate, IsIn, IsNotEmpty 
} from 'class-validator';

export class CreateActivityDto {
  @IsIn(['call', 'email', 'meeting', 'task', 'note'])
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  due_date?: Date;

  @IsBoolean()
  completed: boolean;

  @IsIn(['contact', 'company', 'deal'])
  related_to: 'contact' | 'company' | 'deal';

  @IsString()
  @IsNotEmpty()
  related_id: string;
}