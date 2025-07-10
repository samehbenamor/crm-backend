// review/review.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { BusinessRatingStatsDto } from './dto/business-rating-stats.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  private mapToReviewResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      clientId: review.clientId,
      businessId: review.businessId,
      description: review.description,
      stars: review.stars,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      client: review.client
        ? {
            displayName: review.client.displayName,
          }
        : undefined,
    };
  }

  async createReview(
    clientId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Check if client is following the business
    const follow = await this.prisma.follow.findFirst({
      where: {
        clientId,
        businessId: dto.businessId,
      },
    });

    if (!follow) {
      throw new ForbiddenException('You must follow the business to review it');
    }

    // Check if client has redeemed at least one promotion from this business
    const redemption = await this.prisma.promotionRedemption.findFirst({
      where: {
        wallet: {
          clientId,
          businessId: dto.businessId,
        },
      },
    });

    if (!redemption) {
      throw new ForbiddenException(
        'You must redeem at least one promotion to review this business',
      );
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: {
        clientId_businessId: {
          clientId,
          businessId: dto.businessId,
        },
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this business');
    }

    const review = await this.prisma.review.create({
      data: {
        clientId,
        businessId: dto.businessId,
        description: dto.description,
        stars: dto.stars,
      },
      include: {
        client: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return this.mapToReviewResponse(review);
  }

  async updateReview(
    clientId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.clientId !== clientId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        description: dto.description,
        stars: dto.stars,
      },
      include: {
        client: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return this.mapToReviewResponse(updatedReview);
  }

  async deleteReview(clientId: string, reviewId: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.clientId !== clientId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async getBusinessReviews(businessId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { businessId },
      include: {
        client: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map(this.mapToReviewResponse);
  }

  async getClientReviews(clientId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { clientId },
      include: {
        client: {
          select: {
            displayName: true,
          },
        },
        business: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => ({
      ...this.mapToReviewResponse(review),
      business: {
        name: review.business.name,
        logoUrl: review.business.logoUrl,
      },
    }));
  }

  async getReview(reviewId: string): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: {
          select: {
            displayName: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.mapToReviewResponse(review);
  }
  async getBusinessRatingStats(
    businessId: string,
  ): Promise<BusinessRatingStatsDto> {
    const reviews = await this.prisma.review.findMany({
      where: { businessId },
      select: { stars: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        starCounts: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
      };
    }

    const starCounts = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    let totalStars = 0;

    reviews.forEach((review) => {
      starCounts[review.stars.toString() as keyof typeof starCounts]++;
      totalStars += review.stars;
    });

    const averageRating = parseFloat((totalStars / reviews.length).toFixed(2));

    return {
      averageRating,
      totalReviews: reviews.length,
      starCounts,
    };
  }
  async getClientByUserId(userId: string) {
  const client = await this.prisma.client.findUnique({
    where: { userId },
  });

  if (!client) {
    throw new ForbiddenException('User is not a registered client');
  }

  return client;
}
}
