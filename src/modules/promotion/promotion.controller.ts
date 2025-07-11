// promotion/promotion.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Delete,
  Res,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { RedeemPromotionDto } from './dto/redeem-promotion.dto';
import {
  GenerateRedemptionCodeDto,
  RedeemCodeDto,
} from './dto/generate-redemption-code.dto';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Post('business/:businessId')
  @UseGuards(SupabaseAuthGuard)
  async createBusinessPromotion(
    @Param('businessId') businessId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promotionService.createPromotion(businessId, dto);
  }

  @Get('business/:businessId')
  async getBusinessPromotions(@Param('businessId') businessId: string) {
    return this.promotionService.getBusinessPromotions(businessId);
  }

  @Get('business/:businessId/active')
  async getActiveBusinessPromotions(@Param('businessId') businessId: string) {
    return this.promotionService.getActiveBusinessPromotions(businessId);
  }

  @Put(':promotionId')
  @UseGuards(SupabaseAuthGuard)
  async updatePromotion(
    @Param('promotionId') promotionId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionService.updatePromotion(promotionId, dto);
  }

  @Post('redeem')
  @UseGuards(SupabaseAuthGuard)
  async redeemPromotion(@Body() dto: RedeemPromotionDto) {
    return this.promotionService.redeemPromotion(dto.clientId, dto.promotionId);
  }

  @Get(':promotionId/redemptions')
  @UseGuards(SupabaseAuthGuard)
  async getPromotionRedemptions(@Param('promotionId') promotionId: string) {
    return this.promotionService.getPromotionRedemptions(promotionId);
  }

  @Get('client/:clientId/redemptions')
  @UseGuards(SupabaseAuthGuard)
  async getClientRedemptions(@Param('clientId') clientId: string) {
    return this.promotionService.getClientRedemptions(clientId);
  }
  @Delete(':promotionId')
  @UseGuards(SupabaseAuthGuard)
  async softDeletePromotion(@Param('promotionId') promotionId: string) {
    return this.promotionService.softDeletePromotion(promotionId);
  }
  @Get('business/:businessId/deleted')
  @UseGuards(SupabaseAuthGuard)
  async getDeletedBusinessPromotions(@Param('businessId') businessId: string) {
    return this.promotionService.getDeletedBusinessPromotions(businessId);
  }
  @Post('generate-code')
  @UseGuards(SupabaseAuthGuard)
  async generateRedemptionCode(@Body() dto: GenerateRedemptionCodeDto) {
    return this.promotionService.generateRedemptionCode(
      dto.clientId,
      dto.promotionId,
    );
  }

  @Post('redeem-code')
  @UseGuards(SupabaseAuthGuard)
  async redeemPromotionCode(@Body() dto: RedeemCodeDto) {
    return this.promotionService.redeemPromotionCode(
      dto.code,
      dto.businessOwnerId,
    );
  }

  @Get('code/:code/status')
  @UseGuards(SupabaseAuthGuard)
  async getRedemptionCodeStatus(@Param('code') code: string) {
    return this.promotionService.getRedemptionCodeStatus(code);
  }
  @Get('qrcode/:code')
  @UseGuards(SupabaseAuthGuard)
  async getQRCodeData(@Param('code') code: string) {
    return this.promotionService.getQRCodeImage(code);
  }
  @Get('qrcode/:code/image')
  @UseGuards(SupabaseAuthGuard)
  async getQRCodeImage(@Param('code') code: string, @Res() res: Response) {
    const { path } = await this.promotionService.getQRCodeImage(code);
    const file = createReadStream(join(process.cwd(), path));
    file.pipe(res.type('image/png'));
  }
  @Get('wallet/:walletId/unredeemed')
  @UseGuards(SupabaseAuthGuard)
  async getWalletUnredeemedPromotions(@Param('walletId') walletId: string) {
    return this.promotionService.getWalletUnredeemedPromotions(walletId);
  }

  @Get('wallet/:walletId/redeemed')
  @UseGuards(SupabaseAuthGuard)
  async getWalletRedeemedPromotions(@Param('walletId') walletId: string) {
    return this.promotionService.getWalletRedeemedPromotions(walletId);
  }
  @Get('client/:clientId/unredeemed-codes')
  @UseGuards(SupabaseAuthGuard)
  async getClientUnredeemedCodes(@Param('clientId') clientId: string) {
    return this.promotionService.getClientUnredeemedCodes(clientId);
  }

  @Get('client/:clientId/redeemed-codes')
  @UseGuards(SupabaseAuthGuard)
  async getClientRedeemedCodes(@Param('clientId') clientId: string) {
    return this.promotionService.getClientRedeemedCodes(clientId);
  }
  @Get('client/:clientId/has-redeemed/:businessId')
  @UseGuards(SupabaseAuthGuard)
  async hasClientRedeemedPromotion(
    @Param('clientId') clientId: string,
    @Param('businessId') businessId: string
  ) {
    return this.promotionService.hasClientRedeemedPromotion(clientId, businessId);
  }
}
