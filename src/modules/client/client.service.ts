import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SupabaseConfig } from '../../config/supabase.config';
import { Prisma } from '@prisma/client';
import { UpdateLocationDto } from './dto/update-location.dto';
import { GeospatialService } from '../../common/services/geospatial.service';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig,
    private geospatialService: GeospatialService,
  ) {}

  async createWithTransaction(
    dto: CreateClientDto,
    userId: string,
    prisma: Prisma.TransactionClient,
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
  async updateLocation(id: string, dto: UpdateLocationDto, userId: string) {
    try {
      // Verify the client belongs to the requesting user
      const client = await this.prisma.client.findUnique({
        where: { id, userId },
      });

      if (!client) {
        throw new NotFoundException(
          `Client ${id} not found or not owned by user`,
        );
      }

      return await this.prisma.client.update({
        where: { id },
        data: {
          location: {
            name: dto.name,
            lat: dto.lat,
            lng: dto.lng,
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client ${id} not found`);
      }
      throw error;
    }
  }async findNearbyBusinesses(clientId: string, radiusKm: number = 1) {
  const client = await this.prisma.client.findUnique({
    where: { id: clientId },
    select: { location: true },
  });

  if (!client) {
    throw new NotFoundException(`Client ${clientId} not found`);
  }

  function isGeoLocation(obj: any): obj is { lat: number; lng: number } {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.lat === 'number' &&
      typeof obj.lng === 'number'
    );
  }

  if (!isGeoLocation(client.location)) {
    throw new NotFoundException(`Client ${clientId} has no valid location data`);
  }

  const clientLat = client.location.lat;
  const clientLng = client.location.lng;

  const allBusinesses = await this.prisma.business.findMany({
    where: {
      lat: { not: null },
      lng: { not: null },
    },
  });

  const nearbyBusinesses = allBusinesses
    .filter((business) => {
      if (business.lat == null || business.lng == null) return false;

      const distance = this.geospatialService.calculateDistance(
        clientLat,
        clientLng,
        business.lat,
        business.lng,
      );

      return distance <= radiusKm;
    })
    .map((business) => {
      const distance = this.geospatialService.calculateDistance(
        clientLat,
        clientLng,
        business.lat!,
        business.lng!,
      );

      return {
        ...business,
        distance: Math.round(distance * 1000), // meters
      };
    })
    .sort((a, b) => a.distance - b.distance);

  return nearbyBusinesses;
}

}
