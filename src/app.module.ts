import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import configuration from './config/configuration';
import { SupabaseConfig } from './config/supabase.config'; // Add this import
import { SupabaseModule } from './config/supabase.module'; // Add this import

import { BusinessModule } from './modules/business/business.module';
import { FollowModule } from './modules/follow/follow.module';
import { PostModule } from './modules/post/post.module';
import { ClientModule } from './modules/client/client.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { BusinessOwnerModule } from './modules/business-owner/business-owner.module';
import { OtpModule } from './modules/otp/otp.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { FidelityModule } from './modules/fidelity/fidelity.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { ReviewModule } from './modules/review/review.module';
import { ReferralModule } from './modules/referral/referral.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SupabaseModule,
    AuthModule,
    BusinessModule,
    FollowModule,
    ClientModule,
    BusinessOwnerModule,
    PostModule,
    OnboardingModule,
    OtpModule,
    MailerModule,
    FidelityModule,
    PromotionModule,
    ReviewModule,
    ReferralModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
 
  ],

})
export class AppModule {}
