import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);

  async sendAdminPasswordResetOtp(toEmail: string, otp: string) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME ?? 'ProjectJ';

    if (!apiKey || !senderEmail) {
      // Integration-ready: in production set env vars; in dev we don't hard-fail.
      this.logger.warn(
        'Brevo not configured (BREVO_API_KEY/BREVO_SENDER_EMAIL missing). Email not sent.',
      );
      this.logger.warn(`DEV OTP for ${toEmail}: ${otp}`);
      return;
    }

    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail }],
        subject: 'Password reset code',
        htmlContent: `
          <div>
            <p>Your password reset code is:</p>
            <p style="font-size: 20px; font-weight: 700; letter-spacing: 2px;">${otp}</p>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        timeout: 10_000,
      },
    );
  }
}
