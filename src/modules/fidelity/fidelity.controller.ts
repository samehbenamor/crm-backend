// fidelity/fidelity.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FidelityService } from './fidelity.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { EarnPointsDto } from './dto/earn-points.dto';
import { SpendPointsDto } from './dto/spend-points.dto';

@Controller('fidelity')
export class FidelityController {
  constructor(private readonly fidelityService: FidelityService) {}

  @Get('wallets/:clientId')
  @UseGuards(SupabaseAuthGuard)
  async getClientWallets(@Param('clientId') clientId: string) {
    return this.fidelityService.getClientWallets(clientId);
  }

  @Get('wallet/:clientId/:businessId')
  @UseGuards(SupabaseAuthGuard)
  async getWalletBalance(
    @Param('clientId') clientId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.fidelityService.getWalletBalance(clientId, businessId);
  }

  @Get('transactions/:walletId')
  @UseGuards(SupabaseAuthGuard)
  async getWalletTransactions(@Param('walletId') walletId: string) {
    return this.fidelityService.getWalletTransactions(walletId);
  }

  @Post('earn')
  @UseGuards(SupabaseAuthGuard)
  async earnPoints(@Body() dto: EarnPointsDto) {
    return this.fidelityService.addPoints(
      dto.clientId,
      dto.businessId,
      dto.points,
      'EARNED',
      dto.description,
      dto.referenceId,
      dto.expiresInDays ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000) : undefined,
    );
  }

  @Post('spend')
  @UseGuards(SupabaseAuthGuard)
  async spendPoints(@Body() dto: SpendPointsDto) {
    return this.fidelityService.spendPoints(
      dto.clientId,
      dto.businessId,
      dto.points,
      dto.description,
      dto.referenceId,
    );
  }
}