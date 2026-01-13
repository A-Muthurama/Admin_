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
  ) {
    // 1. Create offer first
    const offer = await this.prisma.offer.create({
      data: {
        ...dto,
        vendorId,
        status: 'PENDING',
        isActive: false,
      },
    });

    // 2. Upload image to Cloudinary
    const uploadResult: any = await this.cloudinary.uploadImage(
      image,
      `offers/${offer.id}`,
    );

    // 3. Save image metadata
    await this.prisma.offerImage.create({
      data: {
        offerId: offer.id,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    return {
      message: 'Offer submitted for approval',
      offerId: offer.id,
    };
  }
}
