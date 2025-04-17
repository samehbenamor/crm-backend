import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../interfaces/user.interface';

// Extend Request to include user property and accessToken
interface RequestWithAuth extends Request {
  user: User;
  accessToken: string;
}

/**
 * Decorator to extract the authenticated user from the request
 * Use with @GetUser() user: User in controller methods after SupabaseAuthGuard
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    
    if (!request.user) {
      throw new UnauthorizedException('User not found in request');
    }
    
    return request.user;
  },
);

/**
 * Decorator to extract the JWT access token from the request
 * Use with @GetAccessToken() token: string in controller methods after SupabaseAuthGuard
 */
export const GetAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    
    if (!request.accessToken) {
      throw new UnauthorizedException('Access token not found in request');
    }
    
    return request.accessToken;
  },
);
