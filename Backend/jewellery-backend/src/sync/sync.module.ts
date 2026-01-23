import { Module } from '@nestjs/common';
import { VendorSyncService } from './vendor-sync.service';

@Module({
  providers: [VendorSyncService],
  exports: [VendorSyncService],
})
export class SyncModule {}
