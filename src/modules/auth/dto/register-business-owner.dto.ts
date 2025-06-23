// auth/dto/register-business-owner.dto.ts
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class RegisterBusinessOwnerDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;


}