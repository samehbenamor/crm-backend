// promotion/promotion.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { RedeemPromotionDto } from './dto/redeem-promotion.dto';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

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
}