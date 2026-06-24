import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VendorModule } from './vendor/vendor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { OfferModule } from './offer/offer.module';
import { UserModule } from './user/user.module';
import { SyncModule } from './sync/sync.module';
import { InternalModule } from './internal/internal.module';
import { PlansModule } from './plans/plans.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    VendorModule,
    AdminModule,
    AuthModule,
    OfferModule,
    UserModule,
    SyncModule,
    InternalModule,
    PlansModule,
    NotificationsModule,
    ProductModule,
    // other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
