import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async createProduct(
    title: string,
    description: string,
    affiliateUrl: string,
    images: Express.Multer.File[],
  ) {
    let image1Url: string | null = null;
    if (images && images.length > 0 && images[0]) {
      const upload1: any = await this.cloudinary.uploadImage(images[0], 'products');
      image1Url = upload1.secure_url;
    }

    let image2Url: string | null = null;
    if (images && images.length > 1 && images[1]) {
      const upload2: any = await this.cloudinary.uploadImage(images[1], 'products');
      image2Url = upload2.secure_url;
    }

    const product = await this.prisma.product.create({
      data: {
        title,
        description: description || '',
        image1_url: image1Url,
        image2_url: image2Url,
        affiliate_url: affiliateUrl,
      },
    });

    return product;
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateProduct(
    id: number,
    title?: string,
    description?: string,
    affiliateUrl?: string,
    images?: Express.Multer.File[],
    targetImageIndex?: string, // '1', '2', or 'both'
    removeImage1?: boolean,
    removeImage2?: boolean,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let image1Url = product.image1_url;
    let image2Url = product.image2_url;

    if (removeImage1) {
      image1Url = null;
    }
    if (removeImage2) {
      image2Url = null;
    }

    if (images && images.length > 0) {
      if (targetImageIndex === 'both' && images.length >= 2) {
        const upload1: any = await this.cloudinary.uploadImage(images[0], 'products');
        image1Url = upload1.secure_url;
        const upload2: any = await this.cloudinary.uploadImage(images[1], 'products');
        image2Url = upload2.secure_url;
      } else if (targetImageIndex === '1' && images[0]) {
        const upload1: any = await this.cloudinary.uploadImage(images[0], 'products');
        image1Url = upload1.secure_url;
      } else if (targetImageIndex === '2' && images[0]) {
        const upload2: any = await this.cloudinary.uploadImage(images[0], 'products');
        image2Url = upload2.secure_url;
      } else {
        // Fallback or default behavior: if 2 images uploaded, update both
        if (images.length >= 2) {
          const upload1: any = await this.cloudinary.uploadImage(images[0], 'products');
          image1Url = upload1.secure_url;
          const upload2: any = await this.cloudinary.uploadImage(images[1], 'products');
          image2Url = upload2.secure_url;
        } else if (images[0]) {
          const upload1: any = await this.cloudinary.uploadImage(images[0], 'products');
          image1Url = upload1.secure_url;
        }
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(affiliateUrl !== undefined && { affiliate_url: affiliateUrl }),
        image1_url: image1Url,
        image2_url: image2Url,
      },
    });
  }

  async deleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }
}
