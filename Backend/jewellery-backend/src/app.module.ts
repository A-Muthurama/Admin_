import { Module } from '@nestjs/common';
import { VendorModule } from './vendor/vendor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { OfferModule } from './offer/offer.module';



@Module({
  imports: [
    PrismaModule,
    VendorModule,
    AdminModule,
    AuthModule,
    OfferModule,
    // other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
