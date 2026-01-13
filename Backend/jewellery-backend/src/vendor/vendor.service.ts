import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { ApplyVendorDto } from './dto/apply-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async apply(dto: ApplyVendorDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.VENDOR_PENDING,
        vendorProfile: {
          create: {
            shopName: dto.shopName,
            ownerName: dto.ownerName,
            kycDocs: dto.kycDocs,
            status: 'PENDING',
          },
        },
      },
    });
  }
}
