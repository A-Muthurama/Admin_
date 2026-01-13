import cloudinary from '../cloudinary/cloudinary.provider';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OfferImageService {
  constructor(private prisma: PrismaService) {}

  async generateUploadSignature(offerId: string, vendorId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer || offer.vendorId !== vendorId || offer.status !== 'APPROVED') {
      throw new ForbiddenException('Image upload not allowed');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: `offers/${offerId}`,
      },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: `offers/${offerId}`,
    };
  }

  async saveImage(offerId: string, url: string, publicId: string) {
    return this.prisma.offerImage.create({
      data: {
        offerId,
        url,
        publicId,
      },
    });
  }
}
