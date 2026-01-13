import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

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
