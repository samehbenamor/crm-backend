import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto  } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpResponse } from '../../common/interfaces/otp.interface';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('request')
  async requestOtp(@Body() dto: RequestOtpDto): Promise<OtpResponse> {
    return this.otpService.generateOtp(dto.email);
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<OtpResponse> {
    return this.otpService.verifyOtp(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<OtpResponse> {
    return this.otpService.resetPassword(dto);
  }
}