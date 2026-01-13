import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('vendors/pending')
  getPendingVendors() {
    return this.adminService.getPendingVendors();
  }

  @Patch('vendors/:userId/approve')
  approveVendor(@Param('userId') userId: string) {
    return this.adminService.approveVendor(userId);
  }

  @Patch('vendors/:userId/reject')
  rejectVendor(@Param('userId') userId: string) {
    return this.adminService.rejectVendor(userId);
  }

  @Get('offers/pending')
  getPendingOffers() {
    return this.adminService.getPendingOffers();
  }

  @Patch('offers/:offerId/approve')
  approveOffer(@Param('offerId') offerId: string) {
    return this.adminService.approveOfferWithMedia(offerId);
  }

  @Patch('offers/:offerId/reject')
  rejectOffer(@Param('offerId') offerId: string) {
    return this.adminService.rejectOfferWithMedia(offerId);
  }
}
