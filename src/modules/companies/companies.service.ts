import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SupabaseConfig } from '../../config/supabase.config';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseConfig: SupabaseConfig
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto, 
    userId: string,
    accessToken: string
  ): Promise<any> {
    const supabase = this.supabaseConfig.getClientWithUser(accessToken);
    
    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
        created_by: userId,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.company.findMany();
  }

  async findOne(id: string): Promise<any> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        contacts: true,
        deals: true,
      },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<any> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.company.delete({
        where: { id },
      });
      return { message: `Company with ID ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      throw error;
    }
  }
}