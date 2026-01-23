import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OfferService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async createOfferWithImage(
    dto: CreateOfferDto,
    image: Express.Multer.File,
    vendorId: string,
    externalOfferId: number, // ✅ ADD THIS (vendor DB offer ID)
  ) {
    /**
     * 1️⃣ Create offer in Prisma WITH externalOfferId
     * This permanently links Prisma Offer ↔ Vendor Offer
     */
    const offer = await this.prisma.offer.create({
      data: {
        ...dto,
        vendorId,
        externalOfferId, // ✅ KEY LINE (Phase 1 fix)
        status: 'PENDING',
        isActive: false,
      },
    });

    /**
     * 2️⃣ Upload image to Cloudinary
     * Folder structure is deterministic and safe
     */
    const uploadResult: any = await this.cloudinary.uploadImage(
      image,
      `offers/${offer.id}`,
    );

    /**
     * 3️⃣ Save image metadata (still PENDING)
     */
    await this.prisma.offerImage.create({
      data: {
        offerId: offer.id,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        status: 'PENDING',
      },
    });

    return {
      message: 'Offer submitted for approval',
      offerId: offer.id,
    };
  }
}
