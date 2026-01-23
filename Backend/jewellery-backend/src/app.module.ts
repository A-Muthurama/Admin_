import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    PrismaModule,
    VendorModule,
    AdminModule,
    AuthModule,
    OfferModule,
    UserModule,
    SyncModule,
    InternalModule,
    // other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
