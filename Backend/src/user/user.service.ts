import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async getApprovedOffers() {
    return this.prisma.offers.findMany({
      where: {
        OR: [
          { status: 'APPROVED' },
          { status: 'approved' }
        ]
      },
      include: {
        vendors: {
          select: {
            shop_name: true,
          },
        },
      },
    });
  }

  async getOfferById(offerId: string) {
    const id = parseInt(offerId);
    return this.prisma.offers.findFirst({
      where: {
        id,
        OR: [
          { status: 'APPROVED' },
          { status: 'approved' }
        ]
      },
      include: {
        vendors: {
          select: {
            shop_name: true,
            owner_name: true,
          },
        },
      },
    });
  }
}
