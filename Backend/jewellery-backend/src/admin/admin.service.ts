import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';
import { VendorSyncService } from 'src/sync/vendor-sync.service';
import { BrevoService } from '../mail/brevo.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private vendorSyncService: VendorSyncService,
    private brevo: BrevoService,
  ) {}

  /* ===================== VENDORS ===================== */

  async getAllVendors() {
    return this.prisma.vendorProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

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
      include: {
        vendorProfile: {
          select: {
            id: true,
            externalVendorId: true,
            shopName: true,
            ownerName: true,
          },
        },
      },
    });

    if (!user || !user.vendorProfile) {
      throw new NotFoundException('Vendor not found');
    }

    // 1️⃣ Update Prisma DB
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { role: Role.VENDOR_APPROVED },
      }),
      this.prisma.vendorProfile.update({
        where: { userId },
        data: { status: 'APPROVED' },
      }),
    ]);

    // 2️⃣ Sync to vendor backend (safe if null)
    await this.vendorSyncService.approveVendor(
      user.vendorProfile.externalVendorId,
    );

    // 3️⃣ Notify vendor (best-effort)
    try {
      await this.brevo.sendVendorApprovedEmail({
        toEmail: user.email,
        shopName: user.vendorProfile.shopName,
        ownerName: user.vendorProfile.ownerName,
      });
    } catch (err: any) {
      this.logger.error(`Failed to send vendor approval email to ${user.email}`);
      this.logger.error(err?.message ?? String(err));
    }

    return { message: 'Vendor approved successfully' };
  }

  async rejectVendor(userId: string, reason?: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: {
        externalVendorId: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // 1️⃣ Update Prisma DB
    await this.prisma.$transaction([
      this.prisma.vendorProfile.update({
        where: { userId },
        data: { status: 'REJECTED' },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { role: Role.VENDOR_PENDING },
      }),
    ]);

    // 2️⃣ Sync to vendor backend
    await this.vendorSyncService.rejectVendor(vendor.externalVendorId, reason);

    return { message: 'Vendor rejected successfully' };
  }

  /* ===================== OFFERS ===================== */

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
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        title: true,
        externalOfferId: true,
        vendor: {
          select: {
            shopName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // 1️⃣ Update Prisma DB
    await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'APPROVED',
        isActive: true,
      },
    });

    // 2️⃣ Sync to vendor backend
    try {
      await this.vendorSyncService.approveOffer(offer.externalOfferId);
    } catch (err) {
      console.warn(
        'Vendor sync failed for offer',
        offer.externalOfferId,
        err.message,
      );
    }

    // 3️⃣ Notify vendor (best-effort)
    try {
      const toEmail = offer.vendor?.user?.email;
      if (toEmail) {
        await this.brevo.sendOfferApprovedEmail({
          toEmail,
          offerTitle: offer.title,
          shopName: offer.vendor?.shopName,
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to send offer approval email for offer ${offerId}`);
      this.logger.error(err?.message ?? String(err));
    }

    return { message: 'Offer approved successfully' };
  }

  async rejectOfferWithMedia(offerId: string, reason?: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        externalOfferId: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // 1️⃣ Update Prisma DB
    await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'REJECTED',
        isActive: false,
      },
    });

    // 2️⃣ Sync to vendor backend
    await this.vendorSyncService.rejectOffer(offer.externalOfferId, reason);

    return { message: 'Offer rejected successfully' };
  }

  /* ===================== DETAILS ===================== */

  async getOfferDetails(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
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
        images: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async getVendorKyc(vendorId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        shopName: true,
        ownerName: true,
        kycDocs: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }
}
