import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class InternalVendorsService {
  constructor(private prisma: PrismaService) {}

  async createPendingVendor(data: {
    externalVendorId: number;
    shopName: string;
    ownerName: string;
    email: string;
    kycDocs?: string;
  }) {
    // Prevent duplicates
    const existing = await this.prisma.vendorProfile.findUnique({
      where: { externalVendorId: data.externalVendorId },
    });

    if (existing) {
      return { message: 'Vendor already synced' };
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: 'TEMP_EXTERNAL_USER', // never used
          role: Role.VENDOR_PENDING,
        },
      });

      await tx.vendorProfile.create({
        data: {
          userId: user.id,
          shopName: data.shopName,
          ownerName: data.ownerName,
          kycDocs: data.kycDocs ?? '',
          status: 'PENDING',
          externalVendorId: data.externalVendorId,
        },
      });

      return { message: 'Vendor synced as PENDING' };
    });
  }
}
