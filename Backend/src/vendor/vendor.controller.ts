import { Controller, Post, Body } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { ApplyVendorDto } from './dto/apply-vendor.dto';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('apply')
  apply(@Body() dto: ApplyVendorDto) {
    return this.vendorService.apply(dto);
  }
}
