import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DealsModule } from './modules/deals/deals.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    CompaniesModule,
    DealsModule,
    ActivitiesModule,
    ContactsModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ], // Add PrismaService to providers
})
export class AppModule {}
