// referral/referral.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ProcessReferralFollowDto } from './dto/process-referral-follow.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';
import { ClientService } from '../client/client.service';
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService, private readonly clientService: ClientService) {}

  @Post()
@UseGuards(SupabaseAuthGuard)
async create(
  @Body() dto: CreateReferralDto,
  @GetUser() user: User,
) {
  const client = await this.clientService.findByUserId(user.id);
  if (!client) {
    throw new Error('Client profile not found');
  }
  return this.referralService.createReferral(client.id, dto.businessId);
}

@Post('process-follow')
@UseGuards(SupabaseAuthGuard)
async processFollow(
  @Body() dto: ProcessReferralFollowDto,
  @GetUser() user: User,
) {
  const client = await this.clientService.findByUserId(user.id);
  if (!client || client.id !== dto.refereeClientId) {
    throw new Error('Unauthorized referral processing');
  }
  
  const result = await this.referralService.processReferralFollow(dto);
  
  return {
    message: 'Successfully processed referral follow',
    referral: result.referral,
    pointsAwarded: result.pointsAwarded,
    referrerClientId: result.referrerClientId
  };
}

   @Get('my-referrals')
  @UseGuards(SupabaseAuthGuard)
  async getMyReferrals(@GetUser() user: User) {
    const client = await this.clientService.findByUserId(user.id);
    return this.referralService.getClientReferrals(client!.id);
  }


  @Get('code/:code')
  async getByCode(@Param('code') code: string) {
    return this.referralService.getReferralByCode(code);
  }

  @Get('validate')
  async validateReferral(
    @Query('code') code: string,
    @Query('businessId') businessId: string,
  ) {
    const referral = await this.referralService.getReferralByCode(code);
    if (!referral || referral.businessId !== businessId) {
      return { isValid: false };
    }
    return { isValid: true, referral };
  }
}