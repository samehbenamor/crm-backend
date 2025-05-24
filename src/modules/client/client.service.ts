import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SupabaseConfig } from '../../config/supabase.config';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async createWithTransaction(
    dto: CreateClientDto,
    userId: string,
    prisma: Prisma.TransactionClient
  ) {
    const { notificationPreferences, ...rest } = dto;

    try {
      return await prisma.client.create({
        data: {
          ...rest,
          
          interests: dto.interests || [],
          notificationPreferences: notificationPreferences || {
            emailNotifications: true,
            pushNotifications: true,
          },
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Client profile already exists for this user');
        }
      }
      throw error;
    }
  }
  async findAll() {
    return this.prisma.client.findMany();
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    try {
      return await this.prisma.client.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.client.delete({
        where: { id },
      });
      return { message: `Client ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client ${id} not found`);
      }
      throw error;
    }
  }
  async findByUserId(userId: string) {
  return this.prisma.client.findUnique({
    where: { userId },
  });
}
}
