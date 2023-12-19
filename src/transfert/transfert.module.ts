import { Module, forwardRef } from '@nestjs/common';
import { TransfertController } from './transfert.controller';
import { TransfertService } from './transfert.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfert } from './entities/transfert.entity';
import { HistoriquesModule } from 'src/historiques/historiques.module';
import { CompteCollecteModule } from 'src/compte-collecte/compte-collecte.module';
import { CompteReservationModule } from 'src/compte-reservation/compte-reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfert]),
    UserModule,
    forwardRef(() => HistoriquesModule),
    CompteCollecteModule,
    CompteReservationModule
  ],
  controllers: [TransfertController],
  providers: [TransfertService],
  exports: [TransfertService],
})
export class TransfertModule {}
