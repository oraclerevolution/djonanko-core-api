import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { UserModule } from 'src/user/user.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [UserModule, TransactionsModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
