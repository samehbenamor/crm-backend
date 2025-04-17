import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient } from '../../config/supabase.config';
import { ConfigType } from '../../config/configuration';

// Extended interface to include both user and JWT token
interface RequestWithAuth extends Request {
  user: any;
  accessToken: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private configService: ConfigService<ConfigType>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const supabaseUrl = this.configService.get('supabase.url', { infer: true })!;
      const supabaseKey = this.configService.get('supabase.publicKey', { infer: true })!;
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      // Attach both the user and token to the request
      request.user = data.user;
      request.accessToken = token;
      
      console.log(data.user); 
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
