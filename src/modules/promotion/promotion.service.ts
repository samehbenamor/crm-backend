// promotion/promotion.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { FidelityService } from '../fidelity/fidelity.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
@Injectable()
export class PromotionService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private fidelityService: FidelityService,
  ) {}

  async createPromotion(businessId: string, dto: CreatePromotionDto) {
    await this.businessService.findOne(businessId);

    return this.prisma.promotion.create({
      data: {
        businessId,
        ...dto,
      },
    });
  }

  async getBusinessPromotions(businessId: string) {
    await this.businessService.findOne(businessId);

    return this.prisma.promotion.findMany({
      where: {
        businessId,
        deletedAt: null, // Only include non-deleted promotions
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveBusinessPromotions(businessId: string) {
    await this.businessService.findOne(businessId);

    return this.prisma.promotion.findMany({
      where: {
        businessId,
        isActive: true,
        deletedAt: null, // Only include non-deleted promotions
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePromotion(promotionId: string, dto: UpdatePromotionDto) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion ${promotionId} not found`);
    }

    return this.prisma.promotion.update({
      where: { id: promotionId },
      data: dto,
    });
  }

  async redeemPromotion(clientId: string, promotionId: string) {
    return this.prisma.$transaction(async (prisma) => {
      // Get promotion with business info
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
        include: { business: true },
      });

      if (!promotion) {
        throw new NotFoundException(`Promotion ${promotionId} not found`);
      }

      if (!promotion.isActive) {
        throw new ConflictException('This promotion is not active');
      }

      // Get or create wallet
      const wallet = await this.fidelityService.getOrCreateWallet(
        clientId,
        promotion.businessId,
      );

      // Check if client has enough points
      if (wallet.points < promotion.pointsCost) {
        throw new ConflictException(
          'Insufficient points to redeem this promotion',
        );
      }

      // Spend points
      await this.fidelityService.spendPoints(
        clientId,
        promotion.businessId,
        promotion.pointsCost,
        `Redeemed promotion: ${promotion.name}`,
        promotionId,
      );

      // Record redemption
      return prisma.promotionRedemption.create({
        data: {
          promotionId,
          walletId: wallet.id,
        },
      });
    });
  }

  async getPromotionRedemptions(promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion ${promotionId} not found`);
    }

    return this.prisma.promotionRedemption.findMany({
      where: { promotionId },
      include: {
        wallet: {
          include: {
            client: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
    });
  }

  async getClientRedemptions(clientId: string) {
    return this.prisma.promotionRedemption.findMany({
      where: {
        wallet: {
          clientId,
        },
      },
      include: {
        promotion: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
    });
  }
  async softDeletePromotion(promotionId: string) {
    // Check if promotion exists
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion ${promotionId} not found`);
    }

    if (promotion.deletedAt) {
      throw new ConflictException('Promotion is already deleted');
    }

    // Soft delete by setting deletedAt timestamp
    return this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        deletedAt: new Date(),
        isActive: false, // Also deactivate the promotion
      },
    });
  }
  async getDeletedBusinessPromotions(businessId: string) {
  await this.businessService.findOne(businessId);

  return this.prisma.promotion.findMany({
    where: { 
      businessId,
      deletedAt: { not: null }, // Only include deleted promotions
    },
    orderBy: { deletedAt: 'desc' },
  });
}
}
