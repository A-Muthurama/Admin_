import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OfferImageService } from './offer-image.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendorGuard } from '../auth/vendor.guard';

@Controller('vendor/offers/:offerId/images')
@UseGuards(JwtAuthGuard, VendorGuard)
export class OfferImageController {
  constructor(private readonly imageService: OfferImageService) {}

  @Post('signature')
  getUploadSignature(@Param('offerId') offerId: string, @Req() req) {
    return this.imageService.generateUploadSignature(
      offerId,
      req.user.vendorId,
    );
  }

  @Post()
  saveImage(
    @Param('offerId') offerId: string,
    @Body() body: { url: string; publicId: string },
  ) {
    return this.imageService.saveImage(
      offerId,
      body.url,
      body.publicId,
    );
  }
}
