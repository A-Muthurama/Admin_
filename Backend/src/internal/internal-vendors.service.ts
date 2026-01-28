import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class InternalVendorsService {
  constructor(private prisma: PrismaService) { }

  async createPendingVendor(data: {
    externalVendorId: number;
    shopName: string;
    ownerName: string;
    email: string;
    kycDocs?: string;
  }) {
    // Prevent duplicates by email
    const existing = await this.prisma.vendors.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { message: 'Vendor already exists' };
    }

    await this.prisma.vendors.create({
      data: {
        id: data.externalVendorId, // Try to preserve the external ID if it's the primary key
        email: data.email,
        shop_name: data.shopName,
        owner_name: data.ownerName,
        status: 'pending',
      },
    });

    return { message: 'Vendor synced as pending' };
  }
}
