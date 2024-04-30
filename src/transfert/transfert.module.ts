import { Module, forwardRef } from '@nestjs/common';
import { TransfertController } from './transfert.controller';
import { TransfertService } from './transfert.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfert } from './entities/transfert.entity';
import { HistoriquesModule } from 'src/historiques/historiques.module';
import { CompteCollecteModule } from 'src/compte-collecte/compte-collecte.module';
import { CompteReservationModule } from 'src/compte-reservation/compte-reservation.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ReferralsModule } from 'src/referrals/referrals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfert]),
    UserModule,
    forwardRef(() => HistoriquesModule),
    CompteCollecteModule,
    CompteReservationModule,
    ConfigModule,
    TransactionsModule,
    NotificationsModule,
    ReferralsModule,
  ],
  controllers: [TransfertController],
  providers: [TransfertService],
  exports: [TransfertService],
})
export class TransfertModule {}
