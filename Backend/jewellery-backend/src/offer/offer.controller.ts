import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendorGuard } from '../auth/vendor.guard';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('vendor/offers')
@UseGuards(JwtAuthGuard, VendorGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createOffer(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreateOfferDto,
    @Req() req,
  ) {
    if (!image) {
      throw new Error('Image is required');
    }

    return this.offerService.createOfferWithImage(
      dto,
      image,
      req.user.vendorId,
    );
  }
}
