import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OfferService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

  async createOfferWithImage(
    dto: CreateOfferDto,
    image: Express.Multer.File,
    vendorId: string,
    externalOfferId: number,
  ) {
    /**
     * 1️⃣ Upload image to Cloudinary first
     */
    const uploadResult: any = await this.cloudinary.uploadImage(
      image,
      `offers/temp`,
    );

    /**
     * 2️⃣ Create offer in Prisma
     */
    const offer = await this.prisma.offers.create({
      data: {
        vendor_id: parseInt(vendorId),
        title: dto.title,
        description: dto.description || '',
        poster_url: uploadResult.secure_url,
        status: 'pending',
      },
    });

    return {
      message: 'Offer submitted for approval',
      offerId: offer.id.toString(),
    };
  }
}
