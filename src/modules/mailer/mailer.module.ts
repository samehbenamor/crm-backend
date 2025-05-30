import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],   // 👈  make it available to other modules
})
export class MailerModule {}
