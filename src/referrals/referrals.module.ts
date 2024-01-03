import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral]),
  ],
  providers: [ReferralsService],
  controllers: [ReferralsController],
  exports: [ReferralsService],
})
export class ReferralsModule {}
