import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseConfig } from '../../config/supabase.config';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(private readonly supabaseConfig: SupabaseConfig) {}

  async validateToken(token: string) {
    const supabase = this.supabaseConfig.client;
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return { user: data.user };
  }

  async refreshToken(refreshToken: string) {
    const supabase = this.supabaseConfig.client;
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  async login(loginDto: LoginDto) {
    const supabase = this.supabaseConfig.client;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      this.logger.error(`Login error: ${error.message}`, error);
      
      // Handle different error cases
      if (error.message.includes('Email not confirmed')) {
        throw new UnauthorizedException('Email not confirmed. Please check your inbox and confirm your email before logging in.');
      } else if (error.message.includes('Invalid login credentials')) {
        throw new UnauthorizedException('Invalid email or password');
      } else {
        throw new UnauthorizedException(`Login failed: ${error.message}`);
      }
    }

    if (!data.session) {
      throw new UnauthorizedException('No session created. Email may not be confirmed.');
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      const supabase = this.supabaseConfig.authClient;
      
      this.logger.log(`Attempting to register user with email: ${registerDto.email}`);
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: {
            username: registerDto.username // Store the username in auth metadata
          }
        }
      });

      if (authError) {
        this.logger.error(`Auth signup error: ${authError.message}`, authError);
        
        // Log additional details for debugging
        if (authError.status === 500 && authError.code === 'unexpected_failure') {
          this.logger.error('This might be caused by a misconfiguration in Supabase or database constraints.');
        }

        throw new BadRequestException(`Registration failed: ${authError.message}`);
      }

      if (!authData || !authData.user) {
        this.logger.error('Auth signup returned no user data');
        throw new BadRequestException('Registration failed: No user data returned');
      }

      this.logger.log(`User registered successfully. User ID: ${authData.user.id}`);
      
      // Check if email confirmation is required
      if (!authData.session) {
        return {
          user: authData.user,
          session: null,
          message: 'Registration successful! Please check your email to confirm your account before logging in.'
        };
      }
      
      return {
        user: authData.user,
        session: authData.session,
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  async resendConfirmation(email: string) {
    try {
      const supabase = this.supabaseConfig.client;
      
      this.logger.log(`Resending confirmation email to: ${email}`);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        this.logger.error(`Resend confirmation error: ${error.message}`, error);
        throw new BadRequestException(`Failed to resend confirmation: ${error.message}`);
      }

      return {
        success: true,
        message: 'Confirmation email has been resent. Please check your inbox.',
      };
    } catch (error) {
      this.logger.error(`Resend confirmation error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to resend confirmation: ${error.message}`);
    }
  }
}
