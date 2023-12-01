import { Module } from '@nestjs/common';
import { HistoriquesController } from './historiques.controller';
import { HistoriquesService } from './historiques.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Historique } from './entities/historique.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Historique
    ])
  ],
  controllers: [HistoriquesController],
  providers: [HistoriquesService],
  exports: [HistoriquesService]
})
export class HistoriquesModule {}
