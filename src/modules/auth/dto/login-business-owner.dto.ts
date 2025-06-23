// auth/dto/login-business-owner.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginBusinessOwnerDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}