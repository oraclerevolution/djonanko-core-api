import { Module } from '@nestjs/common';
import { PaiementController } from './paiement.controller';
import { PaiementService } from './paiement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { HistoriquesModule } from 'src/historiques/historiques.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Paiement
    ]),
    HistoriquesModule,
    UserModule
  ],
  controllers: [PaiementController],
  providers: [PaiementService]
})
export class PaiementModule {}
