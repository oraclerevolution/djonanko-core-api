import { Module, forwardRef } from '@nestjs/common';
import { PaiementController } from './paiement.controller';
import { PaiementService } from './paiement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { HistoriquesModule } from 'src/historiques/historiques.module';
import { UserModule } from 'src/user/user.module';
import { CompteCollecteModule } from 'src/compte-collecte/compte-collecte.module';
import { CompteReservationModule } from 'src/compte-reservation/compte-reservation.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ReferralsModule } from 'src/referrals/referrals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paiement]),
    forwardRef(() => HistoriquesModule),
    UserModule,
    ConfigModule,
    CompteCollecteModule,
    CompteReservationModule,
    TransactionsModule,
    NotificationsModule,
    ReferralsModule,
  ],
  controllers: [PaiementController],
  providers: [PaiementService],
  exports: [PaiementService],
})
export class PaiementModule {}
