import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ValidateTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class ResendConfirmationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
