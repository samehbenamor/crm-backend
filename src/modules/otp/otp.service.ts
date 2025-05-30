import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseConfig } from '../../config/supabase.config';
import * as bcrypt from 'bcrypt';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpResponse } from '../../common/interfaces/otp.interface';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 15;
  private readonly OTP_LENGTH = 4;
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private prisma: PrismaService,
    private supabaseConfig: SupabaseConfig,
    private mailer: MailerService,
  ) {}

  async generateOtp(email: string): Promise<OtpResponse> {
    /* 1.  Look the user up --------------------------------------------- */
    // Use the auth.admin.listUsers() method with a filter instead
    const {
      data: { users },
      error,
    } = await this.supabaseConfig.authClient.auth.admin.listUsers({
      filter: `email = '${email}'`,
    });

    if (error) {
      throw new BadRequestException('Failed to fetch user information');
    }

    if (!users || users.length === 0) {
      throw new BadRequestException('User with this email not found');
    }

    const user = users[0];
    /* 2.  Create a 4-digit code ----------------------------------------- */
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // "3456"
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    /* 3.  Persist & invalidate old codes -------------------------------- */
    await this.prisma.passwordResetOtp.deleteMany({
      where: { email, isUsed: false },
    });
    await this.prisma.passwordResetOtp.create({
      data: { userId: user.id, email, code: hashedCode, expiresAt },
    });

    /* 4.  Send the e-mail (Edge Function) ------------------------------ */
    await this.mailer.sendOtpEmail(email, code);

    /* 5.  Done ---------------------------------------------------------- */
    return { success: true, message: 'OTP sent successfully', expiresAt };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<OtpResponse> {
    const otpRecord = await this.prisma.passwordResetOtp.findFirst({
      where: { email: dto.email, isUsed: false },
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

    // 2. Update password in Supabase WITHOUT hashing — Supabase handles hashing internally
    const {
      data: { users },
      error,
    } = await this.supabaseConfig.authClient.auth.admin.listUsers({
      filter: `email = '${dto.email}'`,
    });

    if (error) {
      throw new BadRequestException('Failed to fetch user information');
    }

    if (!users || users.length === 0) {
      throw new BadRequestException('User with this email not found');
    }
    const user = users[0];
    console.log('User found:', user);

    const { error: updateError } =
      await this.supabaseConfig.authClient.auth.admin.updateUserById(user.id, {
        password: dto.newPassword, // Pass the plain password here
      });

    if (updateError) {
      throw new BadRequestException('Failed to update password');
    }

    // 3. Mark OTP as used
    await this.prisma.passwordResetOtp.updateMany({
      where: { email: dto.email, isUsed: false },
      data: { isUsed: true },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}
