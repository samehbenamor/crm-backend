import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(@Body() dto: CreateFollowDto, @GetUser() user: User) {
    return this.followService.create(dto, user.id);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.followService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.followService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateFollowDto) {
    return this.followService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.followService.remove(id);
  }
}
