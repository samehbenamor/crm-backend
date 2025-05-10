import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFollowDto, clientId: string) {
    return this.prisma.follow.create({
      data: {
        ...dto,
        clientId,
      },
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
}
