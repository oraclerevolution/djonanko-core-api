import { Module } from '@nestjs/common';
import { TransfertController } from './transfert.controller';
import { TransfertService } from './transfert.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfert } from './entities/transfert.entity';
import { HistoriquesModule } from 'src/historiques/historiques.module';
import { CompteCollecteModule } from 'src/compte-collecte/compte-collecte.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfert]),
    UserModule,
    HistoriquesModule,
    CompteCollecteModule
  ],
  controllers: [TransfertController],
  providers: [TransfertService]
})
export class TransfertModule {}
