import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseConfig } from '../../config/supabase.config';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ClientService } from '../client/client.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterBusinessOwnerDto } from './dto/register-business-owner.dto';
import { BusinessOwnerService } from '../business-owner/business-owner.service';
import { LoginBusinessOwnerDto } from './dto/login-business-owner.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseConfig: SupabaseConfig,
    private readonly clientService: ClientService,
    private readonly prisma: PrismaService,
    private readonly businessOwnerService: BusinessOwnerService,
  ) {}

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
        throw new UnauthorizedException(
          'Email not confirmed. Please check your inbox and confirm your email before logging in.',
        );
      } else if (error.message.includes('Invalid login credentials')) {
        throw new UnauthorizedException('Invalid email or password');
      } else {
        throw new UnauthorizedException(`Login failed: ${error.message}`);
      }
    }

    if (!data.session) {
      throw new UnauthorizedException(
        'No session created. Email may not be confirmed.',
      );
    }

    // Get the client profile associated with this user
    const client = await this.clientService.findByUserId(data.user.id);
    if (!client) {
      this.logger.warn(`No client profile found for user ${data.user.id}`);
      // You might want to create one here if that makes sense for your flow
      // Or just return null/undefined for the client
    }

    return {
      user: data.user,
      client, // Include the client profile in the response
      session: data.session,
    };
  }

  async register(registerDto: RegisterDto) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        const supabase = this.supabaseConfig.authClient;

        // Check if email already exists
        const {
          data: { user: existingUser },
        } = await supabase.auth.admin.getUserById(registerDto.email);
        if (existingUser) {
          throw new ConflictException('Email already registered');
        }

        // Create the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: registerDto.email,
            password: registerDto.password,
            options: {
              data: {
                username: registerDto.username,
                first_name: registerDto.firstName,
                last_name: registerDto.lastName,
              },
            },
          },
        );

        if (authError) {
          this.logger.error(
            `Auth signup error: ${authError.message}`,
            authError,
          );
          throw new BadRequestException(
            `Registration failed: ${this.mapAuthError(authError)}`,
          );
        }

        if (!authData?.user) {
          this.logger.error('Auth signup returned no user data');
          throw new BadRequestException(
            'Registration failed: No user data returned',
          );
        }

        // Create client profile
        const clientProfile = await this.clientService.createWithTransaction(
          {
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phoneNumber: registerDto.phoneNumber,
            referralCode: registerDto.referralCode,
            displayName: `${registerDto.firstName} ${registerDto.lastName}`,
            interests: [],
          },
          authData.user.id,
          prisma,
        );

        return {
          user: authData.user,
          client: clientProfile,
          session: authData.session,
        };
      } catch (error) {
        this.logger.error(`Registration error: ${error.message}`, error.stack);

        // Rethrow if it's already a NestJS exception
        if (
          error instanceof BadRequestException ||
          error instanceof ConflictException
        ) {
          throw error;
        }

        throw new BadRequestException(this.mapRegistrationError(error));
      }
    });
  }
  async registerBusinessOwner(registerDto: RegisterBusinessOwnerDto) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        const supabase = this.supabaseConfig.authClient;

        // Check if email already exists
        const {
          data: { user: existingUser },
        } = await supabase.auth.admin.getUserById(registerDto.email);
        if (existingUser) {
          throw new ConflictException('Email already registered');
        }

        // Create the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: registerDto.email,
            password: registerDto.password,
            options: {
              data: {
                username: registerDto.username,
              },
            },
          },
        );

        if (authError) {
          this.logger.error(
            `Auth signup error: ${authError.message}`,
            authError,
          );
          throw new BadRequestException(
            `Registration failed: ${this.mapAuthError(authError)}`,
          );
        }

        if (!authData?.user) {
          this.logger.error('Auth signup returned no user data');
          throw new BadRequestException(
            'Registration failed: No user data returned',
          );
        }

        // Create business owner profile
        const businessOwner =
          await this.businessOwnerService.createWithTransaction(
            {
              displayName: registerDto.displayName,
              phoneNumber: registerDto.phoneNumber,
              //businessCount: 0, // Initialize with 0 businesses
            },
            authData.user.id,
            prisma,
          );

        return {
          user: authData.user,
          businessOwner,
          session: authData.session,
        };
      } catch (error) {
        this.logger.error(`Registration error: ${error.message}`, error.stack);

        if (
          error instanceof BadRequestException ||
          error instanceof ConflictException
        ) {
          throw error;
        }

        throw new BadRequestException(this.mapRegistrationError(error));
      }
    });
  }
  private mapAuthError(error: any): string {
    if (error.message.includes('User already registered')) {
      return 'Email already registered';
    }
    if (error.message.includes('Password should be at least')) {
      return 'Password does not meet requirements';
    }
    if (error.message.includes('Invalid email')) {
      return 'Invalid email format';
    }
    return 'Registration failed due to authentication error';
  }

  private mapRegistrationError(error: any): string {
    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      return 'User information conflicts with existing records';
    }
    return 'Registration failed due to server error';
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
        throw new BadRequestException(
          `Failed to resend confirmation: ${error.message}`,
        );
      }

      return {
        success: true,
        message: 'Confirmation email has been resent. Please check your inbox.',
      };
    } catch (error) {
      this.logger.error(
        `Resend confirmation error: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to resend confirmation: ${error.message}`,
      );
    }
  }
  async getMe(userId: string) {
    // Get user from the JWT token (already validated by SupabaseAuthGuard)
    const supabase = this.supabaseConfig.client;

    // Use the regular getUser method instead of admin.getUserById
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify the user ID matches the token
    if (user.id !== userId) {
      throw new UnauthorizedException('User ID mismatch');
    }

    // Get client profile
    const client = await this.clientService.findByUserId(userId);
    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    return {
      user,
      client,
    };
  }
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    userEmail: string, // Add this parameter
  ) {
    const supabase = this.supabaseConfig.client;

    // First verify old password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail, // Use the email from the parameter
      password: oldPassword,
    });

    if (signInError) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new BadRequestException(
        `Password update failed: ${updateError.message}`,
      );
    }

    return { success: true, message: 'Password updated successfully' };
  }
  async loginBusinessOwner(loginDto: LoginBusinessOwnerDto) {
  const supabase = this.supabaseConfig.client;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginDto.email,
    password: loginDto.password,
  });

  if (error) {
    this.logger.error(`Business owner login error: ${error.message}`, error);
    
    if (error.message.includes('Email not confirmed')) {
      throw new UnauthorizedException(
        'Email not confirmed. Please check your inbox.',
      );
    } else if (error.message.includes('Invalid login credentials')) {
      throw new UnauthorizedException('Invalid email or password');
    }
    throw new UnauthorizedException(`Login failed: ${error.message}`);
  }

  if (!data.session) {
    throw new UnauthorizedException('No session created');
  }

  // Get the business owner profile
  const businessOwner = await this.businessOwnerService.findByUserId(data.user.id);
  if (!businessOwner) {
    throw new NotFoundException('Business owner profile not found');
  }

  return {
    user: data.user,
    businessOwner,
    session: data.session,
  };
}
}
