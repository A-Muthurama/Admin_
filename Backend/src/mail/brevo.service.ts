import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private async sendEmail(params: {
    toEmail: string;
    subject: string;
    htmlContent: string;
  }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME ?? 'Jewellers Paradise Admin';

    if (!apiKey || !senderEmail) {
      this.logger.warn(
        'Brevo not configured (BREVO_API_KEY/BREVO_SENDER_EMAIL missing). Email not sent.',
      );
      return;
    }

    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: params.toEmail }],
          subject: params.subject,
          htmlContent: params.htmlContent,
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
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      this.logger.error(
        `Brevo send failed${status ? ` (HTTP ${status})` : ''} for ${params.toEmail}`,
      );
      if (data) {
        this.logger.error(`Brevo response: ${JSON.stringify(data)}`);
      } else {
        this.logger.error(err?.message ?? String(err));
      }
    }
  }

  private wrapTemplate(innerHtml: string) {
    return `
      <div style="background:#f6f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #ececf1;">
          <div style="padding:18px 20px;background:#2b2b2b;color:#ffffff;">
            <div style="font-size:16px;font-weight:700;letter-spacing:0.2px;">Jewellers Paradise</div>
          </div>
          <div style="padding:20px;">
            ${innerHtml}
          </div>
          <div style="padding:14px 20px;color:#6b7280;font-size:12px;border-top:1px solid #ececf1;">
            If you didn’t request this, you can ignore this email.
          </div>
        </div>
      </div>
    `;
  }

  async sendAdminPasswordResetOtp(toEmail: string, otp: string) {
    const safeOtp = this.escapeHtml(otp);
    const htmlContent = this.wrapTemplate(`
      <h2 style="margin:0 0 10px 0;font-size:18px;color:#111827;">Reset your admin password</h2>
      <p style="margin:0 0 14px 0;color:#374151;font-size:14px;line-height:20px;">
        Use the following one-time code to reset your password.
      </p>
      <div style="text-align:center;margin:18px 0 14px 0;">
        <div style="display:inline-block;background:#f3f4f6;border:1px dashed #d1d5db;border-radius:12px;padding:12px 18px;">
          <span style="font-size:22px;font-weight:800;letter-spacing:6px;color:#111827;">${safeOtp}</span>
        </div>
      </div>
      <p style="margin:0;color:#6b7280;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
    `);

    await this.sendEmail({
      toEmail,
      subject: 'Your password reset code',
      htmlContent,
    });
  }

  async sendVendorApprovedEmail(params: {
    toEmail: string;
    shopName?: string;
    ownerName?: string;
  }) {
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your shop';
    const owner = params.ownerName ? this.escapeHtml(params.ownerName) : '';
    const greeting = owner ? `Hi ${owner},` : 'Hi,';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin:0 0 10px 0;font-size:18px;color:#111827;">Vendor account approved</h2>
      <p style="margin:0 0 10px 0;color:#374151;font-size:14px;line-height:20px;">${greeting}</p>
      <p style="margin:0 0 14px 0;color:#374151;font-size:14px;line-height:20px;">
        Great news — your vendor account for <strong>${shop}</strong> has been approved.
      </p>
      <p style="margin:0;color:#6b7280;font-size:13px;">
        You can now log in and start creating offers.
      </p>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Your vendor account has been approved',
      htmlContent,
    });
  }

  async sendOfferApprovedEmail(params: {
    toEmail: string;
    offerTitle?: string;
    shopName?: string;
  }) {
    const title = params.offerTitle
      ? this.escapeHtml(params.offerTitle)
      : 'your offer';
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your shop';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin:0 0 10px 0;font-size:18px;color:#111827;">Offer approved</h2>
      <p style="margin:0 0 14px 0;color:#374151;font-size:14px;line-height:20px;">
        Your offer <strong>${title}</strong> for <strong>${shop}</strong> has been approved and is now live.
      </p>
      <p style="margin:0;color:#6b7280;font-size:13px;">
        You can log in anytime to manage your offers.
      </p>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Your offer has been approved',
      htmlContent,
    });
  }
  async sendOfferRejectedEmail(params: {
    toEmail: string;
    offerTitle?: string;
    shopName?: string;
    reason?: string;
  }) {
    const title = params.offerTitle
      ? this.escapeHtml(params.offerTitle)
      : 'your offer';
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your shop';
    const reason = params.reason ? this.escapeHtml(params.reason) : 'No reason provided';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin:0 0 10px 0;font-size:18px;color:#ef4444;">Offer rejected</h2>
      <p style="margin:0 0 14px 0;color:#374151;font-size:14px;line-height:20px;">
        Your offer <strong>${title}</strong> for <strong>${shop}</strong> has been rejected.
      </p>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px;margin-bottom:14px;">
        <h3 style="margin:0 0 4px 0;font-size:14px;color:#991b1b;">Reason:</h3>
        <p style="margin:0;color:#b91c1c;font-size:14px;">${reason}</p>
      </div>
      <p style="margin:0;color:#6b7280;font-size:13px;">
        Please review the guidelines and try again.
      </p>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Update on your offer submission',
      htmlContent,
    });
  }
}
