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
    const brandColor = '#3F0E27'; // Luxury Plum
    const accentColor = '#D4AF37'; // Royal Gold
    const bgColor = '#f8f5f6'; // Very light warm grey
    const textColor = '#333333';
    const lightTextColor = '#666666';
    const brandFont = "'Arial Black', Arial, sans-serif";
    const bodyFont = "Arial, Helvetica, sans-serif";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0 !important; }
            .content-padding { padding: 25px 20px !important; }
            .header-padding { padding: 25px 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; text-align: center !important; }
            .mobile-margin-top { margin-top: 10px !important; }
            .brand-text { font-size: 18px !important; }
            .logo-img { height: 40px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: ${bodyFont};">
        <div style="background-color:${bgColor}; padding: 20px 0; font-family: ${bodyFont}; color: ${textColor}; line-height: 1.6;">
          
          <!-- Admin/Preview Text spacer -->
          <div style="max-width: 640px; margin: 0 auto;">
            
            <!-- Main Card -->
            <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 24px rgba(63, 14, 39, 0.08); border: 1px solid #e1e1e1;">
              
              <!-- Header -->
              <tr>
                <td class="header-padding" style="background-color: #3F0E27; padding: 35px 40px; border-bottom: 4px solid ${accentColor};">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <!-- Fluid Layout for Logo & Text -->
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="mobile-stack" style="padding-right: 15px; vertical-align: middle;">
                              <img class="logo-img" src="https://vendor.jewellersparadise.com/images/logo.png" alt="JP" style="height: 45px; width: auto; display: block; margin: 0 auto;" />
                            </td>
                            <td class="mobile-stack mobile-margin-top" style="vertical-align: middle; text-align: left;">
                              <h1 class="brand-text" style="margin: 0; color: #ffffff; font-family: ${brandFont}; font-size: 20px; letter-spacing: 1.5px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">
                                JEWELLERS PARADISE
                              </h1>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td class="content-padding" style="padding: 40px 45px;">
                  ${innerHtml}
                  
                  <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid #f0f0f0;">
                    <p style="margin: 0; font-size: 14px; color: ${lightTextColor}; font-style: italic;">Warm regards,</p>
                    <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: bold; color: ${brandColor}; letter-spacing: 0.5px; text-transform: uppercase;">Jewellers Paradise Team</p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #fcfcfc; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <!-- Icon -->
                  <div style="margin-bottom: 20px;">
                     <img src="https://vendor.jewellersparadise.com/images/logo.png" alt="JP" style="height: 32px; width: auto; display: inline-block; opacity: 0.9;" />
                  </div>

                  <!-- Dot Signatures -->
                  <div style="margin-bottom: 20px;">
                    <span style="display: inline-block; width: 5px; height: 5px; background-color: ${accentColor}; border-radius: 50%; margin: 0 6px;"></span>
                    <span style="display: inline-block; width: 5px; height: 5px; background-color: ${brandColor}; border-radius: 50%; margin: 0 6px;"></span>
                    <span style="display: inline-block; width: 5px; height: 5px; background-color: ${accentColor}; border-radius: 50%; margin: 0 6px;"></span>
                  </div>

                  <p style="margin: 0; color: #888888; font-size: 11px; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">
                    &copy; 2026 JEWELLERS PARADISE. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendAdminPasswordResetOtp(toEmail: string, otp: string) {
    const safeOtp = this.escapeHtml(otp);
    const htmlContent = this.wrapTemplate(`
      <h2 style="margin: 0 0 25px 0; font-size: 22px; color: #3F0E27; text-align: center; letter-spacing: 1px;">Security Verification</h2>
      <p style="margin: 0 0 25px 0; color: #444; font-size: 16px; text-align: center;">
        A request has been made to access your administrative account. Please use the following code to proceed:
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <div style="display: inline-block; background-color: #f9f4f6; border: 1px solid #D4AF37; border-radius: 8px; padding: 20px 40px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #3F0E27; font-family: monospace;">${safeOtp}</span>
        </div>
        <p style="margin: 20px 0 0 0; color: #666; font-size: 13px; font-style: italic;">This verification code is valid for 10 minutes.</p>
      </div>
      <p style="margin: 0; color: #888; font-size: 14px; text-align: center; line-height: 1.6;">
        If you did not initiate this request, please secure your account immediately or notify our system administrator.
      </p>
    `);

    await this.sendEmail({
      toEmail,
      subject: 'Security: Verification Code for Admin Access',
      htmlContent,
    });
  }

  async sendVendorApprovedEmail(params: {
    toEmail: string;
    shopName?: string;
    ownerName?: string;
  }) {
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your establishment';
    const owner = params.ownerName ? this.escapeHtml(params.ownerName) : 'Partner';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin: 0 0 25px 0; font-size: 24px; color: #3F0E27; font-weight: bold;">Account Registration Approved</h2>
      <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Dear Partner,</p>
      <p style="margin: 0 0 25px 0; color: #444; font-size: 15px; line-height: 1.7;">
        We are delighted to confirm that your vendor account registration for <strong style="color: #3F0E27;">${shop}</strong> has been approved. It is our privilege to welcome you as a valued partner of the Jewellers Paradise network.
      </p>
      <div style="background-color: #faf7f8; border-left: 5px solid #D4AF37; padding: 25px; margin-bottom: 30px; border-radius: 4px;">
        <p style="margin: 0; color: #3F0E27; font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Next Steps</p>
        <p style="margin: 10px 0 0 0; color: #555; font-size: 14px; line-height: 1.6;">
          Please access your vendor dashboard to complete your profile setup and begin managing your exclusive collections.
        </p>
      </div>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://vendor.jewellersparadise.com/vendor/login" style="background-color: #3F0E27; color: #ffffff; padding: 16px 40px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border: 1px solid #D4AF37;">Login to Dashboard</a>
      </div>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Approval Notification: Vendor Account Registration',
      htmlContent,
    });
  }

  async sendVendorRejectedEmail(params: {
    toEmail: string;
    shopName?: string;
    ownerName?: string;
    reason?: string;
  }) {
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your establishment';
    const owner = params.ownerName ? this.escapeHtml(params.ownerName) : 'Partner';
    const reason = params.reason ? this.escapeHtml(params.reason) : 'Criteria not met.';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin: 0 0 25px 0; font-size: 24px; color: #3F0E27; font-weight: bold;">Application Update</h2>
      <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Dear Partner,</p>
      <p style="margin: 0 0 25px 0; color: #444; font-size: 15px; line-height: 1.7;">
        This email serves to inform you regarding your registration application for <strong>${shop}</strong>. After a detailed review, we regret to inform you that we are unable to approve your account at this time.
      </p>
      <div style="background-color: #fff9f9; border: 1px solid #e1e1e1; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <p style="margin: 0 0 10px 0; color: #3F0E27; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Reason for Decision:</p>
        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">${reason}</p>
      </div>
      <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.6;">
        You are welcome to address the points mentioned above and resubmit your application for future consideration.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://vendor.jewellersparadise.com/vendor/login" style="background-color: #3F0E27; color: #ffffff; padding: 15px 35px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #D4AF37;">Login to Dashboard</a>
      </div>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Update Regarding Your Jewellers Paradise Application',
      htmlContent,
    });
  }

  async sendOfferApprovedEmail(params: {
    toEmail: string;
    offerTitle?: string;
    shopName?: string;
  }) {
    const title = params.offerTitle ? this.escapeHtml(params.offerTitle) : 'Offer';
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your establishment';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin: 0 0 25px 0; font-size: 24px; color: #3F0E27; font-weight: bold;">Offer Approved</h2>
      <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Dear Partner,</p>
      <p style="margin: 0 0 25px 0; color: #444; font-size: 15px; line-height: 1.7;">
        We are pleased to inform you that your offer titled <strong style="color: #3F0E27;">${title}</strong> for <strong>${shop}</strong> has been successfully approved and is now live on the platform.
      </p>
      <div style="background-color: #fafafa; border: 1px solid #ececec; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 35px;">
        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.5;">This offer is now visible to all registered customers.</p>
      </div>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://vendor.jewellersparadise.com/vendor/login" style="background-color: #3F0E27; color: #ffffff; padding: 15px 35px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #D4AF37;">Go to Dashboard</a>
      </div>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Offer Published: Your Submission is Live',
      htmlContent,
    });
  }

  async sendOfferRejectedEmail(params: {
    toEmail: string;
    offerTitle?: string;
    shopName?: string;
    reason?: string;
  }) {
    const title = params.offerTitle ? this.escapeHtml(params.offerTitle) : 'Offer';
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your establishment';
    const reason = params.reason ? this.escapeHtml(params.reason) : 'Adjustment required.';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin: 0 0 25px 0; font-size: 24px; color: #3F0E27; font-weight: bold;">Action Required: Offer Update</h2>
      <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Dear Partner,</p>
      <p style="margin: 0 0 25px 0; color: #444; font-size: 15px; line-height: 1.7;">
        Your offer submission titled <strong style="color: #3F0E27;">${title}</strong> for <strong>${shop}</strong> has been reviewed. To meet our publication standards, modification is required.
      </p>
      <div style="background-color: #fff9f9; border-left: 5px solid #D4AF37; padding: 25px; margin-bottom: 30px; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #3F0E27; font-weight: bold; font-size: 14px; text-transform: uppercase;">Required Changes:</p>
        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">${reason}</p>
      </div>
      <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.6;">
        Please log in to your vendor dashboard to apply the necessary changes and resubmit for approval.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://vendor.jewellersparadise.com/vendor/login" style="background-color: #3F0E27; color: #ffffff; padding: 15px 35px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Manage Offers</a>
      </div>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Modification Required: Your Offer Submission',
      htmlContent,
    });
  }

  async sendVendorSuspendedEmail(params: {
    toEmail: string;
    shopName?: string;
    ownerName?: string;
  }) {
    const shop = params.shopName ? this.escapeHtml(params.shopName) : 'your establishment';
    const owner = params.ownerName ? this.escapeHtml(params.ownerName) : 'Partner';

    const htmlContent = this.wrapTemplate(`
      <h2 style="margin: 0 0 25px 0; font-size: 24px; color: #3F0E27; font-weight: bold;">Account Status: Suspended</h2>
      <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Dear Partner,</p>
      <p style="margin: 0 0 25px 0; color: #444; font-size: 15px; line-height: 1.7;">
        This email serves as formal notification that your vendor account for <strong>${shop}</strong> has been suspended, effective immediately.
      </p>
      <div style="background-color: #fff9f9; border: 1px solid #e1e1e1; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
          During this suspension period, all active offers will be hidden from public view, and access to the vendor dashboard will be restricted.
        </p>
      </div>
      <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.6;">
        For further details regarding this action or to discuss the reinstatement process, please contact our support team.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://vendor.jewellersparadise.com/vendor/login" style="background-color: #3F0E27; color: #ffffff; padding: 15px 35px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Login to Dashboard</a>
      </div>
    `);

    await this.sendEmail({
      toEmail: params.toEmail,
      subject: 'Important Notification: Account Suspension',
      htmlContent,
    });
  }

}

