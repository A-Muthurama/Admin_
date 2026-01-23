import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getApprovedOffers() {
    return this.prisma.offer.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
      },
      include: {
        images: {
          where: { status: 'APPROVED' },
        },
        vendor: {
          select: {
            shopName: true,
          },
        },
      },
    });
  }
  
  async getOfferById(offerId: string) {
    return this.prisma.offer.findFirst({
      where: {
        id: offerId,
        status: 'APPROVED',
        isActive: true,
      },
      include: {
        images: {
          where: { status: 'APPROVED' },
        },
        vendor: {
          select: {
            shopName: true,
            ownerName: true,
          },
        },
      },
    });
  }
}
