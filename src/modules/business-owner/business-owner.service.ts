import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessOwnerDto } from './dto/create-business-owner.dto';
import { UpdateBusinessOwnerDto } from './dto/update-business-owner.dto';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class BusinessOwnerService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(dto: CreateBusinessOwnerDto, userId: string, accessToken: string) {
    const supabase = this.supabaseConfig.getClientWithUser(accessToken);

    return this.prisma.businessOwner.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.businessOwner.findMany();
  }

  async findOne(id: string) {
    const owner = await this.prisma.businessOwner.findUnique({
      where: { id },
    });
    if (!owner) throw new NotFoundException(`Business owner ${id} not found`);
    return owner;
  }

  async update(id: string, dto: UpdateBusinessOwnerDto) {
    try {
      return await this.prisma.businessOwner.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Business owner ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.businessOwner.delete({
        where: { id },
      });
      return { message: `Business owner ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Business owner ${id} not found`);
      }
      throw error;
    }
  }
}
