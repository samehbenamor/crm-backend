// onboarding.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async submitOnboarding(userId: string, dto: SubmitOnboardingDto) {
    return this.prisma.clientOnboarding.upsert({
      where: { userId },
      update: {
        appUsage: dto.appUsage,
        discovery: dto.discovery,
        interests: dto.interests,
        customDiscovery: dto.customDiscovery,
      },
      create: {
        userId,  // Stores Supabase user ID directly
        appUsage: dto.appUsage,
        discovery: dto.discovery,
        interests: dto.interests,
        customDiscovery: dto.customDiscovery,
      },
    });
  }

  async getOnboarding(userId: string) {
    return this.prisma.clientOnboarding.findUnique({
      where: { userId },
    });
  }
}