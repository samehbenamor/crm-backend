import { Body, Controller, Post, UseGuards, Get, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ValidateTokenDto,
  ResendConfirmationDto,
} from './dto/auth.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate-token')
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto.token);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        success: true,
        data: {
          user: result.user,
          client: result.client,
          session: result.session,
        },
        message: 'Registration successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.message || 'Registration failed',
        error: error.response?.error || 'Internal server error',
      };
    }
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getMe(@GetUser() user: User) {
    return this.authService.getMe(user.id);
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body() resendDto: ResendConfirmationDto) {
    return this.authService.resendConfirmation(resendDto.email);
  }
  @Put('change-password')
  @UseGuards(SupabaseAuthGuard)
  async changePassword(
    @Body() dto: { oldPassword: string; newPassword: string },
    @GetUser() user: User,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
      user.email, // Pass the email from the authenticated user
    );
  }
}
