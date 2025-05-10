import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUrl,
  IsPhoneNumber,
} from 'class-validator';

export class CreateBusinessOwnerDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsPhoneNumber('TN')
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  website?: string;
}
