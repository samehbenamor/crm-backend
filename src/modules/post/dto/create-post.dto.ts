import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString()
  businessId: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  imageUrls?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  isPinned: boolean;
}
