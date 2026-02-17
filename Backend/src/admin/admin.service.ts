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
  ) { }

  /* ===================== VENDORS ===================== */

  async getAllVendors() {
    const vendors = await this.prisma.vendors.findMany({
      orderBy: { created_at: 'desc' },
      include: { kyc_documents: true },
    });

    return vendors.map(v => ({
      id: v.id.toString(),
      externalVendorId: v.id,
      userId: v.id.toString(),
      shopName: v.shop_name,
      ownerName: v.owner_name || '',
      kycDocs: v.kyc_documents.map(d => d.file_url),
      status: v.status?.toUpperCase() || 'PENDING',
      createdAt: v.created_at,
      phone: v.phone || '',
      city: v.city || '',
      state: v.state || '',
      user: {
        id: v.id.toString(),
        email: v.email || '',
        role: v.status?.toUpperCase() === 'APPROVED' ? 'VENDOR_APPROVED' : v.status?.toUpperCase() === 'SUSPENDED' ? 'VENDOR_PENDING' : 'VENDOR_PENDING',
      },
    }));
  }

  async getPendingVendors() {
    // Check both cases just to be safe, but prioritize uppercase as per user's feedback
    const vendors = await this.prisma.vendors.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'pending' },
        ],
      },
      include: { kyc_documents: true },
    });

    return vendors.map(v => ({
      id: v.id.toString(),
      externalVendorId: v.id,
      userId: v.id.toString(),
      shopName: v.shop_name,
      ownerName: v.owner_name || '',
      kycDocs: v.kyc_documents.map(d => d.file_url),
      status: 'PENDING',
      createdAt: v.created_at,
      phone: v.phone || '',
      city: v.city || '',
      state: v.state || '',
      user: {
        id: v.id.toString(),
        email: v.email || '',
        role: 'VENDOR_PENDING',
      },
    }));
  }

  async approveVendor(userId: string) {
    const id = parseInt(userId);
    const vendor = await this.prisma.vendors.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Calculate days since creation
    const now = new Date();
    const createdAt = vendor.created_at || now;
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Convert to IST for storage (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const approvedAtIST = new Date(now.getTime() + istOffset);

    this.logger.log(`Approving vendor ${id}. CreatedAt: ${createdAt}, Now: ${now}, Days: ${daysCount}, ApprovedAtIST: ${approvedAtIST}`);

    // Update status to 'APPROVED'
    const updatedVendor = await this.prisma.vendors.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_at: approvedAtIST,
        days_count: daysCount
      },
    });
    this.logger.log(`Vendor ${id} updated. DB Result - ApprovedAt: ${updatedVendor.approved_at}, Days: ${updatedVendor.days_count}`);

    // Notify vendor
    if (vendor.email) {
      try {
        await this.brevo.sendVendorApprovedEmail({
          toEmail: vendor.email,
          shopName: vendor.shop_name,
          ownerName: vendor.owner_name || 'Vendor',
        });
      } catch (err: any) {
        this.logger.error(`Failed to send email to ${vendor.email}: ${err.message}`);
      }
    }

    return { message: 'Vendor approved successfully' };
  }

  async rejectVendor(userId: string, reason?: string) {
    this.logger.log(`Rejecting vendor ${userId} with reason: "${reason}"`);
    const id = parseInt(userId);
    const vendor = await this.prisma.vendors.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Update status to 'rejected'
    // Note: 'rejectionReason' 
    await this.prisma.vendors.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejection_reason: reason,
      },
    });
    this.logger.log(`Vendor ${id} status successfully set to REJECTED.`);

    // Notify vendor
    if (vendor.email) {
      try {
        await this.brevo.sendVendorRejectedEmail({
          toEmail: vendor.email,
          shopName: vendor.shop_name,
          ownerName: vendor.owner_name || 'Vendor',
          reason: reason,
        });
      } catch (err: any) {
        this.logger.error(`Failed to send rejection email to ${vendor.email}: ${err.message}`);
      }
    }

    return { message: 'Vendor rejected successfully' };
  }

  async suspendVendor(userId: string) {
    this.logger.log(`Suspending vendor ${userId}`);
    const id = parseInt(userId);
    const vendor = await this.prisma.vendors.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Update status to 'SUSPENDED'
    await this.prisma.vendors.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
      },
    });

    // Notify vendor
    if (vendor.email) {
      try {
        await this.brevo.sendVendorSuspendedEmail({
          toEmail: vendor.email,
          shopName: vendor.shop_name,
          ownerName: vendor.owner_name || 'Vendor',
        });
      } catch (err: any) {
        this.logger.error(`Failed to send suspension email to ${vendor.email}: ${err.message}`);
      }
    }

    return { message: 'Vendor suspended successfully' };
  }

  /* ===================== OFFERS ===================== */

  async getPendingOffers() {
    this.logger.log('Fetching pending offers from legacy table...');
    const data = await this.prisma.offers.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'pending' },
        ],
      },
      include: {
        vendors: {
          select: {
            shop_name: true,
            owner_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return data.map(o => ({
      ...o,
      id: o.id.toString(),
      vendorId: o.vendor_id?.toString() || '', // ✅ CRITICAL: Map vendor_id to vendorId
      price: o.discount_value_numeric ? parseFloat(o.discount_value_numeric.toString()) : 0,
      storeLat: 0,
      storeLng: 0,
      status: (o.status?.toUpperCase() || 'PENDING') as any,
      poster_url: o.poster_url || '', // Ensure this is mapped for the frontend
      images: o.poster_url ? [{ id: 'poster', url: o.poster_url, status: 'APPROVED', createdAt: new Date().toISOString(), offerId: o.id.toString(), publicId: 'legacy' }] : [],
      vendor: {
        shopName: o.vendors?.shop_name || 'Unknown Shop',
        ownerName: o.vendors?.owner_name || '',
        phone: o.vendors?.phone || '',
        user: { email: o.vendors?.email || '' }
      }
    }));
  }

  async getAllOffers() {
    const data = await this.prisma.offers.findMany({
      include: {
        vendors: {
          select: {
            shop_name: true,
            owner_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { created_at: 'desc' }
    });

    return data.map(o => ({
      ...o,
      id: o.id.toString(),
      createdAt: o.created_at?.toISOString() || '',
      vendorId: o.vendor_id?.toString() || '', // ✅ CRITICAL: Map vendor_id to vendorId
      price: o.discount_value_numeric ? parseFloat(o.discount_value_numeric.toString()) : 0,
      storeLat: 0,
      storeLng: 0,
      status: (o.status?.toUpperCase() || 'PENDING') as any,
      poster_url: o.poster_url || '',
      video_url: o.video_url || '',
      images: [
        ...(o.poster_url ? [{ id: `poster-${o.id}`, url: o.poster_url, status: 'APPROVED', createdAt: new Date().toISOString(), offerId: o.id.toString(), publicId: 'legacy-p' }] : []),
        ...(o.video_url ? [{ id: `video-${o.id}`, url: o.video_url, status: 'APPROVED', createdAt: new Date().toISOString(), offerId: o.id.toString(), publicId: 'legacy-v' } as any] : [])
      ],
      vendor: {
        shopName: o.vendors?.shop_name || 'Unknown Shop',
        ownerName: o.vendors?.owner_name || '',
        phone: o.vendors?.phone || '',
        user: { email: o.vendors?.email || '' }
      }
    }));
  }

  async approveOfferWithMedia(offerId: string) {
    const id = parseInt(offerId);
    const offer = await this.prisma.offers.findUnique({
      where: { id },
      include: { vendors: true }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // 1️⃣ Update Prisma DB
    await this.prisma.offers.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });

    // 2️⃣ Sync to vendor backend
    try {
      await this.vendorSyncService.approveOffer(offer.id);
    } catch (err) {
      console.warn(
        'Vendor sync failed for offer',
        offer.id,
        err.message,
      );
    }

    // 3️⃣ Notify vendor
    try {
      const toEmail = offer.vendors?.email;
      if (toEmail) {
        await this.brevo.sendOfferApprovedEmail({
          toEmail,
          offerTitle: offer.title,
          shopName: offer.vendors?.shop_name || 'Vendor',
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to send offer approval email for offer ${offerId}`);
    }

    return { message: 'Offer approved successfully' };
  }

  async rejectOfferWithMedia(offerId: string, reason?: string) {
    this.logger.log(`Rejecting offer ${offerId} with reason: "${reason}"`);
    const id = parseInt(offerId);

    if (isNaN(id)) {
      this.logger.error(`Invalid offer ID format: ${offerId}`);
      throw new Error(`Invalid offer ID: ${offerId}`);
    }

    const offer = await this.prisma.offers.findUnique({
      where: { id },
      include: { vendors: true },
    });

    if (!offer) {
      this.logger.warn(`Offer ${id} not found for rejection.`);
      throw new NotFoundException('Offer not found');
    }

    // 1️⃣ Sync to vendor backend (Internal sync might fail, so we wrap it)
    try {
      this.logger.log(`Syncing rejection for offer ${id} to vendor backend...`);
      await this.vendorSyncService.rejectOffer(offer.id, reason);
    } catch (err: any) {
      this.logger.warn(`Vendor sync failed (ignored) for offer ${id}: ${err.message}`);
    }

    // 2️⃣ Notify vendor via Email
    try {
      const toEmail = offer.vendors?.email;
      if (toEmail) {
        this.logger.log(`Sending rejection email for offer ${id} to ${toEmail}...`);
        await this.brevo.sendOfferRejectedEmail({
          toEmail,
          offerTitle: offer.title,
          shopName: offer.vendors?.shop_name || 'Vendor',
          reason,
        });
      } else {
        this.logger.warn(`No email found for vendor of offer ${id}.`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send offer rejection email for offer ${id}: ${err.message}`);
    }

    // 3️⃣ Update Prisma DB to REJECTED (instead of deleting)
    try {
      this.logger.log(`Setting offer ${id} status to REJECTED...`);
      await this.prisma.offers.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejection_reason: reason,
        },
      });
      this.logger.log(`Offer ${id} status successfully set to REJECTED.`);
    } catch (err: any) {
      this.logger.error(`Database update failed for offer ${id}: ${err.message}`);
      throw err;
    }

    return { message: 'Offer rejected successfully' };
  }

  /* ===================== DETAILS ===================== */

  async getOfferDetails(offerId: string) {
    const id = parseInt(offerId);
    const offer = await this.prisma.offers.findUnique({
      where: { id },
      include: {
        vendors: true
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return {
      ...offer,
      id: offer.id.toString(),
      createdAt: offer.created_at?.toISOString() || '',
      vendorId: offer.vendor_id?.toString() || '',
      price: offer.discount_value_numeric ? parseFloat(offer.discount_value_numeric.toString()) : 0,
      storeLat: 0,
      storeLng: 0,
      status: (offer.status?.toUpperCase() || 'PENDING') as any,
      poster_url: offer.poster_url || '',
      video_url: offer.video_url || '',
      images: [
        ...(offer.poster_url ? [{ id: `poster-${offer.id}`, url: offer.poster_url, status: 'APPROVED', createdAt: new Date().toISOString(), offerId: offer.id.toString(), publicId: 'legacy-p' }] : []),
        ...(offer.video_url ? [{ id: `video-${offer.id}`, url: offer.video_url, status: 'APPROVED', createdAt: new Date().toISOString(), offerId: offer.id.toString(), publicId: 'legacy-v' } as any] : [])
      ],
      vendor: {
        shopName: offer.vendors?.shop_name || 'Unknown Shop',
        ownerName: offer.vendors?.owner_name || '',
        phone: offer.vendors?.phone || '',
        user: { email: offer.vendors?.email || '' }
      }
    };
  }

  async getVendorKyc(vendorId: string) {
    const id = parseInt(vendorId);
    const vendor = await this.prisma.vendors.findUnique({
      where: { id },
      include: { kyc_documents: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Map to expected Response format
    return {
      shopName: vendor.shop_name,
      ownerName: vendor.owner_name || '',
      status: vendor.status?.toUpperCase() || 'PENDING',
      phone: vendor.phone || '',
      city: vendor.city || '',
      state: vendor.state || '',
      address: vendor.address || '',
      pincode: vendor.pincode || '',
      kycDocs: vendor.kyc_documents.map(d => ({
        type: d.doc_type,
        url: d.file_url
      })),
      user: {
        email: vendor.email || '',
      },
    };
  }

  /* ===================== DELETE ===================== */

  async deleteVendor(userId: string) {
    const id = parseInt(userId);
    try {
      await this.prisma.vendors.delete({
        where: { id },
      });
      return { message: 'Vendor deleted successfully' };
    } catch (err) {
      this.logger.error(`Failed to delete vendor ${id}: ${err.message}`);
      throw new NotFoundException('Vendor not found or could not be deleted');
    }
  }

  async deleteOffer(offerId: string) {
    const id = parseInt(offerId);
    try {
      await this.prisma.offers.delete({
        where: { id },
      });
      return { message: 'Offer deleted successfully' };
    } catch (err) {
      this.logger.error(`Failed to delete offer ${id}: ${err.message}`);
      throw new NotFoundException('Offer not found or could not be deleted');
    }
  }
}
