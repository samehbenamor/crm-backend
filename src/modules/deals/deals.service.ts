import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealStage } from '@prisma/client';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(
    createDealDto: CreateDealDto, 
    ownerId: string,
    accessToken: string
  ): Promise<any> {
    const supabase = this.supabaseConfig.getClientWithUser(accessToken);
    
    return this.prisma.deal.create({
      data: {
        ...createDealDto,
        stage: createDealDto.stage as DealStage,
        owner_id: ownerId,
      },
      include: {
        company: true,
        contact: true,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.deal.findMany({
      include: {
        company: true,
        contact: true,
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
      },
    });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto): Promise<any> {
    try {
      return await this.prisma.deal.update({
        where: { id },
        data: {
          ...updateDealDto,
          stage: updateDealDto.stage as DealStage,
        },
        include: {
          company: true,
          contact: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Deal with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.deal.delete({
        where: { id },
      });
      return { message: `Deal with ID ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Deal with ID ${id} not found`);
      }
      throw error;
    }
  }
}