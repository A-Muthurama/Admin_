import { Controller, Get, Patch, Param, UseGuards, Body, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('vendors')
  getAllVendors() {
    return this.adminService.getAllVendors();
  }

  @Get('vendors/pending')
  getPendingVendors() {
    return this.adminService.getPendingVendors();
  }

  @Patch('vendors/:userId/approve')
  approveVendor(@Param('userId') userId: string) {
    return this.adminService.approveVendor(userId);
  }

  @Patch('vendors/:userId/reject')
  rejectVendor(@Param('userId') userId: string, @Body() body: any) {
    console.log('Reject Vendor Request:', { userId, body });
    const reason = body.reason;
    return this.adminService.rejectVendor(userId, reason);
  }

  @Patch('vendors/:userId/suspend')
  suspendVendor(@Param('userId') userId: string) {
    return this.adminService.suspendVendor(userId);
  }

  @Get('offers/pending')
  getPendingOffers() {
    return this.adminService.getPendingOffers();
  }

  @Get('offers')
  getAllOffers() {
    return this.adminService.getAllOffers();
  }

  @Patch('offers/:offerId/approve')
  approveOffer(@Param('offerId') offerId: string) {
    return this.adminService.approveOfferWithMedia(offerId);
  }

  @Patch('offers/:offerId/reject')
  rejectOffer(@Param('offerId') offerId: string, @Body() body: any) {
    const reason = body.reason;
    return this.adminService.rejectOfferWithMedia(offerId, reason);
  }

  @Get('offers/:offerId')
  getOfferDetails(@Param('offerId') offerId: string) {
    return this.adminService.getOfferDetails(offerId);
  }

  @Get('vendors/:vendorId/kyc')
  getVendorKyc(@Param('vendorId') vendorId: string) {
    return this.adminService.getVendorKyc(vendorId);
  }

  @Delete('vendors/:userId')
  deleteVendor(@Param('userId') userId: string) {
    return this.adminService.deleteVendor(userId);
  }

  @Delete('offers/:offerId')
  deleteOffer(@Param('offerId') offerId: string) {
    return this.adminService.deleteOffer(offerId);
  }
}
