import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  businessId: string;
}