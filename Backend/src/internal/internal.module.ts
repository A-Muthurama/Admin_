import { Module, MiddlewareConsumer } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { InternalAuthMiddleware } from 'src/common/middleware/internalAuth.middleware';
import { InternalVendorsController } from './internal-vendors.controller';
import { InternalVendorsService } from './internal-vendors.service';

@Module({
  controllers: [InternalVendorsController],
  providers: [InternalVendorsService, PrismaService],
})
export class InternalModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalAuthMiddleware)
      .forRoutes('internal/vendors');
  }
}
