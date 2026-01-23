import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('offers')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getOffers() {
    return this.userService.getApprovedOffers();
  }

  @Get(':offerId')
  getOffer(@Param('offerId') offerId: string) {
    return this.userService.getOfferById(offerId);
  }
}
