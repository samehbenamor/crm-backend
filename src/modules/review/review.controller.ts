import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async create(@Body() dto: CreateReviewDto, @GetUser() user: User) {
    const client = await this.reviewService.getClientByUserId(user.id);
    return this.reviewService.createReview(client.id, dto);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @GetUser() user: User,
  ) {
    const client = await this.reviewService.getClientByUserId(user.id);
    return this.reviewService.updateReview(client.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async remove(@Param('id') id: string, @GetUser() user: User) {
    const client = await this.reviewService.getClientByUserId(user.id);
    return this.reviewService.deleteReview(client.id, id);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  async getMyReviews(@GetUser() user: User) {
    const client = await this.reviewService.getClientByUserId(user.id);
    return this.reviewService.getClientReviews(client.id);
  }

  // Keep all other endpoints unchanged
  @Get('business/:businessId')
  getBusinessReviews(@Param('businessId') businessId: string) {
    return this.reviewService.getBusinessReviews(businessId);
  }

  @Get('client/:clientId')
  getClientReviews(@Param('clientId') clientId: string) {
    return this.reviewService.getClientReviews(clientId);
  }

  @Get(':id')
  getReview(@Param('id') id: string) {
    return this.reviewService.getReview(id);
  }

  @Get('stats/business/:businessId')
  getBusinessRatingStats(@Param('businessId') businessId: string) {
    return this.reviewService.getBusinessRatingStats(businessId);
  }
}