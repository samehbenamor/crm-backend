import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(dto: CreateClientDto, userId: string, accessToken: string) {
  const supabase = this.supabaseConfig.getClientWithUser(accessToken);

  const { notificationPreferences, ...rest } = dto;

  return this.prisma.client.create({
    data: {
      ...rest,
      ...(notificationPreferences || {}), // flatten notification preferences if provided
      userId,
    },
  });
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
}
