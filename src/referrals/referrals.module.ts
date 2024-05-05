import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referrals } from './entities/referrals.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Referrals])],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
