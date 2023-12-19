import { Module, forwardRef } from '@nestjs/common';
import { HistoriquesController } from './historiques.controller';
import { HistoriquesService } from './historiques.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Historique } from './entities/historique.entity';
import { PaiementModule } from 'src/paiement/paiement.module';
import { TransfertModule } from 'src/transfert/transfert.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Historique
    ]),
    forwardRef(() => PaiementModule),
    forwardRef(() => TransfertModule),
    UserModule
  ],
  controllers: [HistoriquesController],
  providers: [HistoriquesService],
  exports: [HistoriquesService]
})
export class HistoriquesModule {}
