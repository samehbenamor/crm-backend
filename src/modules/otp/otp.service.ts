import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseConfig } from '../../config/supabase.config';
import * as bcrypt from 'bcrypt';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto  } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpResponse } from '../../common/interfaces/otp.interface';
import fetch from 'node-fetch';
@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 15;
  private readonly OTP_LENGTH = 4;

  constructor(
    private prisma: PrismaService,
    private supabaseConfig: SupabaseConfig
  ) {}
// src/auth/otp/otp.service.ts
// Supabase is fucking cringe. Really fucking cringe.
// It doesn't allow you to use the service key to get user by email.
// You have to use the admin client, which is not available in the client SDK.
// Complete utter bullshit.
/*async getUserByEmail(email: string) {
  const supabaseUrl = this.supabaseConfig.client.supabaseUrl; // or get from configService
  const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY; // you may need to expose it or read again
  //https://<project_ref>.supabase.co/rest/v1/
  const response = await fetch(`${supabaseUrl}/rest/v1/admin/users?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new BadRequestException('Failed to fetch user from Supabase');
  }

  const users = await response.json();
  return users.length ? users[0] : null;
}*/

async generateOtp(email: string): Promise<OtpResponse> {
  /* 1.  Look the user up --------------------------------------------- */
  ///https://<project_ref>.supabase.co/rest/v1/
  const {
    data: { user },
    error,
  } = await this.supabaseConfig.authClient.auth.admin.getUserByEmail(email); // v2+
  if (error) {
    throw new BadRequestException('Failed to fetch user information');
  }
  if (!user) {
    throw new BadRequestException('User with this email not found');
  }

  /* 2.  Create a 4-digit code ----------------------------------------- */
  const code       = Math.floor(1000 + Math.random() * 9000).toString(); // "3456"
  const hashedCode = await bcrypt.hash(code, 10);
  const expiresAt  = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

  /* 3.  Persist & invalidate old codes -------------------------------- */
  await this.prisma.passwordResetOtp.deleteMany({ where: { email, isUsed: false } });
  await this.prisma.passwordResetOtp.create({
    data: { userId: user.id, email, code: hashedCode, expiresAt },
  });

  /* 4.  Send the e-mail (Edge Function) ------------------------------ */
  const { error: emailError } = await this.supabaseConfig.client.functions.invoke('send-email', {
    body: JSON.stringify({
      to: email,
      subject: 'Your password-reset code',
      html: `<p>Your verification code is <strong>${code}</strong></p>`,
    }),
  });
  if (emailError) {
    throw new BadRequestException('Failed to send OTP e-mail');
  }

  /* 5.  Done ---------------------------------------------------------- */
  return { success: true, message: 'OTP sent successfully', expiresAt };
}


  async verifyOtp(dto: VerifyOtpDto): Promise<OtpResponse> {
    const otpRecord = await this.prisma.passwordResetOtp.findFirst({
      where: { email: dto.email, isUsed: false }
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    const isValid = await bcrypt.compare(dto.code, otpRecord.code);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    return { success: true, message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<OtpResponse> {
    // 1. Verify OTP first
    await this.verifyOtp(dto);

    // 2. Update password in Supabase
    const { data: { user }, error: userError } = await this.supabaseConfig.client.auth.admin.getUserByEmail(dto.email);
    
    if (userError || !user) {
      throw new BadRequestException('User not found');
    }

    const { error: updateError } = await this.supabaseConfig.client.auth.admin.updateUserById(user.id, {
      password: dto.newPassword
    });

    if (updateError) {
      throw new BadRequestException('Failed to update password');
    }

    // 3. Mark OTP as used
    await this.prisma.passwordResetOtp.updateMany({
      where: { email: dto.email, isUsed: false },
      data: { isUsed: true }
    });

    return { success: true, message: 'Password updated successfully' };
  }
}