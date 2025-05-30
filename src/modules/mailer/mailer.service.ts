import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,          // SSL
    secure: true,
    auth: {
      user: process.env.SMTP_USER, // Gmail address
      pass: process.env.SMTP_PASS, // 16-char App Password
    },
  });

  /** HTML template loaded at start-up */
  private readonly htmlTemplate: string;

  constructor() {
    /**
     * dist/  structure at runtime:
     * dist/
     * ├── modules/
     * │   └── mailer/
     * │       └── mailer.service.js   ← __dirname
     * └── templates/
     *     └── otp-email.html
     *
     * Going three levels up lands in dist/, then /templates/…
     */
    const templatePath = join(__dirname, '..', '..', '..', 'templates', 'otp-email.html');

    this.htmlTemplate = readFileSync(templatePath, 'utf8');
    this.logger.debug(`Loaded e-mail template from ${templatePath}`);
  }

  /**
   * Replace {{CODE}} placeholder and send the message.
   */
  async sendOtpEmail(to: string, code: string): Promise<void> {
  const html = this.htmlTemplate.replace(/{{\s*CODE\s*}}/g, code);

  await this.transporter.sendMail({
    from: `"YourApp Support" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your password-reset code',
    html,
  });

  this.logger.debug(`OTP e-mail sent to ${to}`);
}

}
