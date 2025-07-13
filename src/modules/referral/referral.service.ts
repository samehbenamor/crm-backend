// referral/referral.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ProcessReferralFollowDto } from './dto/process-referral-follow.dto';
import { BusinessService } from '../business/business.service';
import { ClientService } from '../client/client.service';
import { v4 as uuidv4 } from 'uuid';
interface ReferralWithDetails {
  id: string;
  referrerId: string;
  refereeId: string | null;
  businessId: string;
  referralCode: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
  business?: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  referee?: {
    id: string;
    displayName: string;
  };
  referrer?: {
    id: string;
    displayName: string;
  };
}

@Injectable()
export class ReferralService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private clientService: ClientService,
  ) { }

  async generateReferralCode(): Promise<string> {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  async createReferral(
    referrerClientId: string,
    businessId: string
  ): Promise<any> {
    // Verify business exists (still needed)
    await this.businessService.findOne(businessId);

    const referralCode = await this.generateReferralCode();
    console.log('Attempting to create referral with:', {
      referrerClientId,
      businessId,
      clientExists: await this.prisma.client.count({
        where: { id: referrerClientId }
      })
    });
    return this.prisma.referral.create({
      data: {
        referrerClientId, // Now using pre-validated ID
        businessId,
        referralCode,
        isCompleted: false,
      },
    });
  }


  async processReferralFollow(dto: ProcessReferralFollowDto): Promise<any> {
    // Verify business exists
    await this.businessService.findOne(dto.businessId);

    // Verify referee client exists
    const referee = await this.clientService.findOne(dto.refereeClientId);
    if (!referee) {
      throw new Error('Referee client not found');
    }

    // Find pending referral
    const referral = await this.prisma.referral.findFirst({
      where: {
        businessId: dto.businessId,
        refereeClientId: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!referral) {
      throw new Error('No pending referral found');
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Update referral status
      const updatedReferral = await prisma.referral.update({
        where: { id: referral.id },
        data: {
          refereeClientId: dto.refereeClientId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // 2. Award points to referrer (not the follower!)
      const pointsToAward = 100; // Or get this from business config
      const referrerWallet = await prisma.pointsWallet.upsert({
        where: {
          clientId_businessId: {
            clientId: referral.referrerClientId,
            businessId: dto.businessId
          }
        },
        update: { points: { increment: pointsToAward } },
        create: {
          clientId: referral.referrerClientId,
          businessId: dto.businessId,
          points: pointsToAward
        }
      });

      // 3. Record transaction
      await prisma.pointsTransaction.create({
        data: {
          walletId: referrerWallet.id,
          points: pointsToAward,
          type: 'EARNED',
          description: `Referral bonus for ${referral.id}`,
          referenceId: referral.id
        }
      });

      return {
        referral: updatedReferral,
        pointsAwarded: pointsToAward,
        referrerClientId: referral.referrerClientId
      };
    });
  }

  async getClientReferrals(clientId: string): Promise<any[]> {
    return this.prisma.referral.findMany({
      where: { referrerClientId: clientId }, // Changed from referrerId
      include: {
        business: { select: { id: true, name: true, logoUrl: true } },
        referee: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getReferralByCode(code: string): Promise<any> {
    return this.prisma.referral.findUnique({
      where: { referralCode: code },
      include: {
        business: true,
        referrer: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }
}