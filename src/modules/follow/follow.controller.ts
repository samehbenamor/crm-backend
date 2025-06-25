import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
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
  create(@Body() dto: CreateFollowDto) {
    // Remove @GetUser() parameter
    return this.followService.create(dto); // Just pass the DTO
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
  @Get('is-following/:clientId/:businessId')
  @UseGuards(SupabaseAuthGuard)
  async isFollowing(
    @Param('clientId') clientId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.followService.isFollowing(clientId, businessId);
  }
  // Add these endpoints to your FollowController

  @Get('business-followers/:businessId')
  @UseGuards(SupabaseAuthGuard)
  async getBusinessFollowers(@Param('businessId') businessId: string) {
    const followers =
      await this.followService.findFollowersByBusinessId(businessId);
    const count = await this.followService.getBusinessFollowCount(businessId);

    return {
      count,
      followers,
    };
  }

  @Get('latest-follower/:businessId')
  @UseGuards(SupabaseAuthGuard)
  async getLatestFollower(@Param('businessId') businessId: string) {
    return this.followService.getLatestBusinessFollower(businessId);
  }
}
