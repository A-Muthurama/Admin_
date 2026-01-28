import { Controller, Post, Body } from '@nestjs/common';
import { InternalVendorsService } from './internal-vendors.service';

@Controller('internal/vendors')
export class InternalVendorsController {
  constructor(private readonly service: InternalVendorsService) {}

  @Post()
  async createPendingVendor(@Body() body: any) {
    return this.service.createPendingVendor(body);
  }
}
