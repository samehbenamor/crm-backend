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
import { v4 as uuidv4 } from 'uuid';
import { QrCodeService } from './qr-code.service';
@Injectable()
export class PromotionService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private fidelityService: FidelityService,
    private qrCodeService: QrCodeService, // Add this
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
  async getRedemptionCodeStatus(code: string) {
    const redemptionCode = await this.prisma.promotionRedemptionCode.findUnique(
      {
        where: { code },
        include: {
          promotion: {
            include: {
              business: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    );

    if (!redemptionCode) {
      throw new NotFoundException('Code not found');
    }

    return {
      isValid: !redemptionCode.isRedeemed,
      isRedeemed: redemptionCode.isRedeemed,
      promotion: redemptionCode.promotion,
    };
  }
  async generateRedemptionCode(clientId: string, promotionId: string) {
    return this.prisma.$transaction(async (prisma) => {
      // Verify promotion exists and is active
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
        include: { business: true },
      });

      if (!promotion || !promotion.isActive) {
        throw new NotFoundException('Promotion not found or inactive');
      }

      // Get or create wallet
      const wallet = await this.fidelityService.getOrCreateWallet(
        clientId,
        promotion.businessId,
      );

      // Check points balance
      if (wallet.points < promotion.pointsCost) {
        throw new ConflictException('Insufficient points');
      }

      // Deduct points immediately
      await this.fidelityService.spendPoints(
        clientId,
        promotion.businessId,
        promotion.pointsCost,
        `Reserved for promotion: ${promotion.name}`,
        promotionId,
      );

      // Generate unique code
      const code = uuidv4();

      // Generate QR code and get path
      const qrCodePath = await this.qrCodeService.generateQRCode(
        code,
        promotionId,
        clientId,
      );

      // Create redemption code record
      return prisma.promotionRedemptionCode.create({
        data: {
          promotionId,
          walletId: wallet.id,
          code,
          qrCodePath,
          isRedeemed: false, // Explicitly set to false
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
      });
    });
  }

  async redeemPromotionCode(code: string) {
    return this.prisma.$transaction(async (prisma) => {
      const redemptionCode = await prisma.promotionRedemptionCode.findUnique({
        where: { code },
        include: {
          promotion: true,
          wallet: {
            include: {
              client: true,
            },
          },
        },
      });

      if (!redemptionCode) {
        throw new NotFoundException('Invalid redemption code');
      }

      if (redemptionCode.isRedeemed) {
        throw new ConflictException('Code already redeemed');
      }

      // Delete QR code folder
      await this.qrCodeService.deleteQRCodeFolder(
        redemptionCode.promotionId,
        redemptionCode.wallet.clientId,
      );

      // Mark code as redeemed
      await prisma.promotionRedemptionCode.update({
        where: { id: redemptionCode.id },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
        },
      });

      // Create redemption record
      const redemption = await prisma.promotionRedemption.create({
        data: {
          promotionId: redemptionCode.promotionId,
          walletId: redemptionCode.walletId,
        },
        include: {
          promotion: {
            include: {
              business: true,
            },
          },
        },
      });

      return redemption; // Just return the redemption directly since we're including business
    });
  }

  async getWalletUnredeemedPromotions(walletId: string) {
    return this.prisma.promotionRedemptionCode.findMany({
      where: {
        walletId,
        isRedeemed: false,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWalletRedeemedPromotions(walletId: string) {
    return this.prisma.promotionRedemptionCode.findMany({
      where: {
        walletId,
        isRedeemed: true,
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

  async getQRCodeImage(code: string) {
    const redemptionCode = await this.prisma.promotionRedemptionCode.findUnique(
      {
        where: { code },
      },
    );

    if (!redemptionCode) {
      throw new NotFoundException('Code not found');
    }

    if (redemptionCode.isRedeemed) {
      throw new ConflictException('Code already redeemed');
    }

    return {
      path: redemptionCode.qrCodePath,
      code: redemptionCode.code,
    };
  }
}
