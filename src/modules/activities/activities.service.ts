import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityType, RelatedToType } from '@prisma/client';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class ActivitiesService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(
    createActivityDto: CreateActivityDto, 
    ownerId: string,
    accessToken: string
  ): Promise<any> {
    // Get Supabase client with user context if needed
    const supabase = this.supabaseConfig.getClientWithUser(accessToken);
    
    // You can perform additional Supabase operations here if needed
    // For example, verify the user exists or get additional user info
    
    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        type: createActivityDto.type as ActivityType,
        related_to: createActivityDto.related_to as RelatedToType,
        owner_id: ownerId,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.activity.findMany();
  }

  async findOne(id: string): Promise<any> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<any> {
    try {
      return await this.prisma.activity.update({
        where: { id },
        data: {
          ...updateActivityDto,
          type: updateActivityDto.type as ActivityType,
          related_to: updateActivityDto.related_to as RelatedToType,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.activity.delete({
        where: { id },
      });
      return { message: `Activity with ID ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }
      throw error;
    }
  }

  async complete(id: string): Promise<any> {
    try {
      return await this.prisma.activity.update({
        where: { id },
        data: {
          completed: true,  // Assuming you have a 'completed' boolean field in your Activity model
          completed_at: new Date(),  // Optional: if you want to track when it was completed
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }
      throw error;
    }
  }
}