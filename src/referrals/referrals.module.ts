import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referrals } from './entities/referrals.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referrals]),
    UserModule
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService]
})
export class ReferralsModule {}
