import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { ApplyVendorDto } from './dto/apply-vendor.dto';

import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) { }

  async apply(dto: ApplyVendorDto) {
    const existing = await this.prisma.vendors.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const vendor = await this.prisma.vendors.create({
      data: {
        email: dto.email,
        password_hash: hashedPassword,
        shop_name: dto.shopName,
        owner_name: dto.ownerName,
        status: 'pending',
      },
    });

    // Notify Admins
    this.notificationsGateway.broadcastNotification('new_vendor', {
      id: vendor.id,
      shopName: vendor.shop_name,
      ownerName: vendor.owner_name,
    });

    return vendor;
  }
}
