import { Body, Controller, Delete, Get, Param, Post as HttpPost, Put, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost()
  @UseGuards(SupabaseAuthGuard)
  create(@Body() dto: CreatePostDto, @GetUser() user: User) {
    return this.postService.create(dto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
