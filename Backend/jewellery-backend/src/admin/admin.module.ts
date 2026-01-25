import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SyncModule } from 'src/sync/sync.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [SyncModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
