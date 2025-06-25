import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFollowDto) {
    // Remove clientId parameter
    return this.prisma.follow.create({
      data: dto, // Just use the DTO directly
    });
  }

  async findAll() {
    return this.prisma.follow.findMany();
  }

  async findOne(id: string) {
    const follow = await this.prisma.follow.findUnique({ where: { id } });
    if (!follow) throw new NotFoundException(`Follow ${id} not found`);
    return follow;
  }

  async update(id: string, dto: UpdateFollowDto) {
    try {
      return await this.prisma.follow.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Follow ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.follow.delete({ where: { id } });
      return { message: `Follow ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Follow ${id} not found`);
      }
      throw error;
    }
  }
  async isFollowing(clientId: string, businessId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findFirst({
      where: {
        clientId,
        businessId,
      },
    });
    return !!follow; // Returns true if follow exists, false otherwise
  }
  async findFollowersByBusinessId(businessId: string) {
    return this.prisma.follow.findMany({
      where: { businessId },
      include: {
        client: true, // Include full client information
      },
      orderBy: {
        followedAt: 'desc', // Order by most recent first
      },
    });
  }

  async getBusinessFollowCount(businessId: string) {
    return this.prisma.follow.count({
      where: { businessId },
    });
  }

  async getLatestBusinessFollower(businessId: string) {
    return this.prisma.follow.findFirst({
      where: { businessId },
      include: {
        client: true,
      },
      orderBy: {
        followedAt: 'desc',
      },
    });
  }
}
