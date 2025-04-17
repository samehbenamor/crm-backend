import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(
    createContactDto: CreateContactDto, 
    userId: string,
    accessToken: string
  ): Promise<any> {
    const supabase = this.supabaseConfig.getClientWithUser(accessToken);
    
    return this.prisma.contact.create({
      data: {
        ...createContactDto,
        created_by: userId,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.contact.findMany({
      include: {
        company: true,
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        deals: true,
      },
    });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<any> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: updateContactDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.contact.delete({
        where: { id },
      });
      return { message: `Contact with ID ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      throw error;
    }
  }
}