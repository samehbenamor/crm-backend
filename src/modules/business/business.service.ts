import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SupabaseConfig } from '../../config/supabase.config';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { moveSync } from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { Business } from '../../common/interfaces/business.interface';
import { BusinessOwnerService } from '../business-owner/business-owner.service';

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig,
    private readonly businessOwnerService: BusinessOwnerService,
  ) {}

  private toBusinessInterface(business: any): Business {
    return {
      id: business.id,
      ownerId: business.ownerId,
      name: business.name,
      description: business.description,
      category: business.category,
      location: {
        address: business.address || undefined,
        city: business.city || undefined,
        state: business.state || undefined,
        country: business.country || undefined,
        lat: business.lat || undefined,
        lng: business.lng || undefined,
      },
      logoUrl: business.logoUrl || undefined,
      coverPhotoUrl: business.coverPhotoUrl || undefined,
      isVerified: business.isVerified,
      followersCount: business.followersCount,
      postsCount: business.postsCount,
      createdAt: business.createdAt.toISOString(),
      updatedAt: business.updatedAt?.toISOString(),
    };
  }
  private async moveAndStoreImages(
    profileImage: Express.Multer.File | undefined,
    coverImage: Express.Multer.File | undefined,
    businessId: string,
    businessName: string,
  ): Promise<{ profileUrl: string; coverUrl: string }> {
    const basePath = join(process.cwd(), 'uploads', 'businesses');
    const businessFolderName = `${businessName}-${businessId}`
      .replace(/\s+/g, '-')
      .toLowerCase();
    const businessFolderPath = join(basePath, businessFolderName);
    const profileDir = join(businessFolderPath, 'profile');
    const coverDir = join(businessFolderPath, 'cover');

    if (!existsSync(profileDir)) mkdirSync(profileDir, { recursive: true });
    if (!existsSync(coverDir)) mkdirSync(coverDir, { recursive: true });

    let profileUrl = '';
    let coverUrl = '';

    if (profileImage) {
      const ext = profileImage.originalname.split('.').pop();
      const filename = `profile-${uuidv4()}.${ext}`;
      const dest = join(profileDir, filename);
      try {
        console.log('Moving profile image from:', profileImage.path);
        console.log('To:', dest);
        moveSync(profileImage.path, dest, { overwrite: true });
        profileUrl = `/businesses/${businessFolderName}/profile/${filename}`;
      } catch (err) {
        console.error('Error moving profile image:', err);
      }
    }
    if (coverImage) {
      const ext = coverImage.originalname.split('.').pop();
      const filename = `cover-${uuidv4()}.${ext}`;
      const dest = join(coverDir, filename);
      try {
        console.log('Moving cover image from:', coverImage.path);
        console.log('To:', dest);
        moveSync(coverImage.path, dest, { overwrite: true });
        coverUrl = `/businesses/${businessFolderName}/cover/${filename}`;
      } catch (err) {
        console.error('Error moving profile image:', err);
      }
    }

    return { profileUrl, coverUrl };
  }

  async create(
    dto: CreateBusinessDto,
    userId: string,
    accessToken: string,
    profileImage?: Express.Multer.File,
    coverImage?: Express.Multer.File,
  ): Promise<Business> {
    // First, find the business owner associated with this user
    let businessOwner: {
      id: string;
      displayName: string;
      phoneNumber: string | null;
      businessCount: number;
      bio: string | null;
      website: string | null;
      userId: string;
      created_at: Date;
      updated_at: Date;
    };
    try {
      businessOwner = await this.businessOwnerService.findByUserId(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException(
          'User is not registered as a business owner',
        );
      }
      throw error;
    }

    const supabase = this.supabaseConfig.getClientWithUser(accessToken);
    const { location, ...rest } = dto;

    // Create the business with the business owner's ID
    const business = await this.prisma.business.create({
      data: {
        ...rest,
        address: location?.address,
        city: location?.city,
        state: location?.state,
        country: location?.country,
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
        ownerId: businessOwner.id, // Use the business owner's ID instead of user ID
        followersCount: 0,
        postsCount: 0,
      },
    });

    const { profileUrl, coverUrl } = await this.moveAndStoreImages(
      profileImage,
      coverImage,
      business.id,
      business.name,
    );

    const updatedBusiness = await this.prisma.business.update({
      where: { id: business.id },
      data: {
        logoUrl: profileUrl,
        coverPhotoUrl: coverUrl,
      },
    });

    return this.toBusinessInterface(updatedBusiness);
  }

  async findAll(): Promise<Business[]> {
    const businesses = await this.prisma.business.findMany();
    return businesses.map((business) => this.toBusinessInterface(business));
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException(`Business ${id} not found`);
    return this.toBusinessInterface(business);
  }

  async update(
    id: string,
    dto: UpdateBusinessDto,
    profileImage?: Express.Multer.File,
    coverImage?: Express.Multer.File,
  ): Promise<Business> {
    try {
      const business = await this.prisma.business.findUnique({ where: { id } });
      if (!business) throw new NotFoundException(`Business ${id} not found`);

      const updateData: any = { ...dto };

      if (dto.location) {
        updateData.address = dto.location.address;
        updateData.city = dto.location.city;
        updateData.state = dto.location.state;
        updateData.country = dto.location.country;
        updateData.lat = dto.location.lat;
        updateData.lng = dto.location.lng;
        delete updateData.location;
      }

      if (profileImage || coverImage) {
        const { profileUrl, coverUrl } = await this.moveAndStoreImages(
          profileImage,
          coverImage,
          business.id,
          business.name,
        );

        if (profileImage) updateData.logoUrl = profileUrl;
        if (coverImage) updateData.coverPhotoUrl = coverUrl;
      }

      const updatedBusiness = await this.prisma.business.update({
        where: { id },
        data: updateData,
      });

      return this.toBusinessInterface(updatedBusiness);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Business ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
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
  async findByOwner(ownerId: string): Promise<Business[]> {
    const businesses = await this.prisma.business.findMany({
      where: { ownerId },
    });
    return businesses.map((business) => this.toBusinessInterface(business));
  }
}
