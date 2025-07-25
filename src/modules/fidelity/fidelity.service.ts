// fidelity/fidelity.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientService } from '../client/client.service';
import { BusinessService } from '../business/business.service';

@Injectable()
export class FidelityService {
  constructor(
    private prisma: PrismaService,
    private clientService: ClientService,
    private businessService: BusinessService,
  ) {}

  async getOrCreateWallet(clientId: string, businessId: string) {
    // Verify client and business exist
    await this.clientService.findOne(clientId);
    await this.businessService.findOne(businessId);

    return this.prisma.pointsWallet.upsert({
      where: { clientId_businessId: { clientId, businessId } },
      update: {},
      create: {
        clientId,
        businessId,
        points: 0,
      },
    });
  }

  async getClientWallets(clientId: string) {
    await this.clientService.findOne(clientId);
    return this.prisma.pointsWallet.findMany({
      where: { clientId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }
async getClientWalletsWithoutTransactions(clientId: string) {
  await this.clientService.findOne(clientId);
  return this.prisma.pointsWallet.findMany({
    where: { clientId },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  });
}
  async getWalletTransactions(walletId: string) {
    const wallet = await this.prisma.pointsWallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    return this.prisma.pointsTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addPoints(
    clientId: string,
    businessId: string,
    points: number,
    type: 'EARNED' | 'ADJUSTMENT',
    description: string,
    referenceId?: string,
    expiresAt?: Date,
  ) {
    if (points <= 0) {
      throw new ConflictException('Points to add must be positive');
    }

    return this.prisma.$transaction(async (prisma) => {
      const wallet = await prisma.pointsWallet.upsert({
        where: { clientId_businessId: { clientId, businessId } },
        update: {
          points: { increment: points },
          lastUpdated: new Date(),
        },
        create: {
          clientId,
          businessId,
          points,
          lastUpdated: new Date(),
        },
      });

      await prisma.pointsTransaction.create({
        data: {
          walletId: wallet.id,
          points,
          type,
          description,
          referenceId,
          expiresAt,
        },
      });

      return wallet;
    });
  }

  async spendPoints(
    clientId: string,
    businessId: string,
    points: number,
    description: string,
    referenceId?: string,
  ) {
    if (points <= 0) {
      throw new ConflictException('Points to spend must be positive');
    }

    return this.prisma.$transaction(async (prisma) => {
      const wallet = await prisma.pointsWallet.findUnique({
        where: { clientId_businessId: { clientId, businessId } },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }
      if (wallet.points < points) {
        throw new ConflictException('Insufficient points');
      }

      const updatedWallet = await prisma.pointsWallet.update({
        where: { id: wallet.id },
        data: {
          points: { decrement: points },
          lastUpdated: new Date(),
        },
      });

      await prisma.pointsTransaction.create({
        data: {
          walletId: wallet.id,
          points: -points,
          type: 'SPENT',
          description,
          referenceId,
        },
      });

      return updatedWallet;
    });
  }

  async getWalletBalance(clientId: string, businessId: string) {
    const wallet = await this.getOrCreateWallet(clientId, businessId);
    return { points: wallet.points };
  }

  async expirePoints() {
    const now = new Date();
    const expiringTransactions = await this.prisma.pointsTransaction.findMany({
      where: {
        expiresAt: { lte: now },
        type: 'EARNED',
        expired: false,
      },
      include: { wallet: true },
    });

    for (const transaction of expiringTransactions) {
      await this.prisma.$transaction([
        this.prisma.pointsTransaction.update({
          where: { id: transaction.id },
          data: { expired: true },
        }),
        this.prisma.pointsTransaction.create({
          data: {
            walletId: transaction.walletId,
            points: -transaction.points,
            type: 'EXPIRATION',
            description: `Points expired from transaction ${transaction.id}`,
          },
        }),
        this.prisma.pointsWallet.update({
          where: { id: transaction.walletId },
          data: {
            points: { decrement: transaction.points },
            lastUpdated: now,
          },
        }),
      ]);
    }

    return { expiredCount: expiringTransactions.length };
  }
  async getClientsWithPointsForBusiness(businessId: string) {
    // Verify business exists
    await this.businessService.findOne(businessId);

    return this.prisma.pointsWallet.findMany({
      where: { 
        businessId
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          },
        },
      },
      orderBy: {
        points: 'desc', // Order by points descending (highest first)
      },
    });
  }
}