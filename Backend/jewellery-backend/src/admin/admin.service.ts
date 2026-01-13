import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

async getPendingVendors() {
  return this.prisma.vendorProfile.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}


  async approveVendor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user || !user.vendorProfile) {
      throw new NotFoundException('Vendor not found');
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { role: Role.VENDOR_APPROVED },
      }),
      this.prisma.vendorProfile.update({
        where: { userId },
        data: { status: 'APPROVED' },
      }),
    ]);
  }

async rejectVendor(userId: string) {
  return this.prisma.$transaction([
    this.prisma.vendorProfile.update({
      where: { userId },
      data: { status: 'REJECTED' },
    }),
    this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.VENDOR_PENDING },
    }),
  ]);
}


  async getPendingOffers() {
    return this.prisma.offer.findMany({
      where: { status: 'PENDING' },
      include: {
        vendor: {
          select: {
            shopName: true,
            ownerName: true,
            user: {
              select: { email: true },
            },
          },
        },
      },
    });
  }


  async approveOfferWithMedia(offerId: string) {
    return this.prisma.$transaction([
      this.prisma.offer.update({
        where: { id: offerId },
        data: {
          status: 'APPROVED',
          isActive: true,
        },
      }),
    ]);
  }

  async rejectOfferWithMedia(offerId: string) {
    return this.prisma.$transaction([
      this.prisma.offer.update({
        where: { id: offerId },
        data: {
          status: 'REJECTED',
          isActive: false,
        },
      }),
    ]);
  }
}
