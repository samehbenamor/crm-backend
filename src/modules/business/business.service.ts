import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(dto: CreateBusinessDto, ownerId: string, accessToken: string) {
  const supabase = this.supabaseConfig.getClientWithUser(accessToken);

  const { location, ...rest } = dto;

  return this.prisma.business.create({
    data: {
      ...rest,
      ...(location || {}), // flatten location fields if provided
      ownerId,
    },
  });
}

  async findAll() {
    return this.prisma.business.findMany();
  }

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException(`Business ${id} not found`);
    return business;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    try {
      return await this.prisma.business.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Business ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.business.delete({ where: { id } });
      return { message: `Business ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Business ${id} not found`);
      }
      throw error;
    }
  }
}
