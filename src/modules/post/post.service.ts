import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto) {
    return this.prisma.post.create({ data: dto });
  }

  async findAll() {
    return this.prisma.post.findMany();
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    try {
      return await this.prisma.post.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.post.delete({ where: { id } });
      return { message: `Post ${id} removed` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post ${id} not found`);
      }
      throw error;
    }
  }
}
