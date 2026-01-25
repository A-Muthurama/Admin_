import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BrevoService } from '../mail/brevo.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private brevo: BrevoService,
  ) {}

  private generateSixDigitOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async adminLogin(email: string, password: string) {
    const admin = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.jwt.sign({
        sub: admin.id,
        role: admin.role,
      }),
    };
  }

  /**
   * Forgot password (ADMIN)
   * - Always returns a generic message (prevents email enumeration)
   * - Sends a 6-digit OTP via Brevo when configured
   */
  async adminForgotPasswordRequest(email: string) {
    const generic = {
      message: 'If an account exists for that email, a code has been sent.',
      cooldownSeconds: 30,
    };

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || user.role !== 'ADMIN') {
        return generic;
      }

      const last = await this.prisma.adminPasswordResetOtp.findFirst({
        where: { userId: user.id, usedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      if (last) {
        const ageMs = Date.now() - last.createdAt.getTime();
        if (ageMs < 30_000) {
          return generic;
        }
      }

      const otp = this.generateSixDigitOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60_000);

      await this.prisma.adminPasswordResetOtp.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt,
        },
      });

      await this.brevo.sendAdminPasswordResetOtp(email, otp);
      return generic;
    } catch (err: any) {
      this.logger.error(`adminForgotPasswordRequest failed for ${email}`);
      this.logger.error(err?.message ?? String(err));
      return generic;
    }
  }

  /**
   * Verifies OTP and returns a short-lived reset token.
   */
  async adminForgotPasswordVerify(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid OTP');
    }

    const record = await this.prisma.adminPasswordResetOtp.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (record.attempts >= 5) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const ok = await bcrypt.compare(otp, record.otpHash);
    if (!ok) {
      await this.prisma.adminPasswordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.adminPasswordResetOtp.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    const reset_token = this.jwt.sign(
      {
        sub: user.id,
        purpose: 'admin_password_reset',
      },
      { expiresIn: '15m' },
    );

    return { reset_token };
  }

  /**
   * Resets password using reset token issued by verify.
   */
  async adminForgotPasswordReset(resetToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(resetToken);
    } catch {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (!payload?.sub || payload?.purpose !== 'admin_password_reset') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const password = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password },
    });

    return { message: 'Password reset successful' };
  }

  async vendorLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true },
    });

    if (
      !user ||
      user.role !== 'VENDOR_APPROVED' ||
      user.vendorProfile?.status !== 'APPROVED'
    ) {
      throw new UnauthorizedException('Vendor not approved');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.jwt.sign({
        sub: user.id,
        role: user.role,
        vendorId: user.vendorProfile.id,
      }),
    };
  }
}
