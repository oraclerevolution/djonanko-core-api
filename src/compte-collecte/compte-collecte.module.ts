import { Module } from '@nestjs/common';
import { CompteCollecteController } from './compte-collecte.controller';
import { CompteCollecteService } from './compte-collecte.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompteCollect } from './entities/compte-collect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompteCollect])],
  controllers: [CompteCollecteController],
  providers: [CompteCollecteService],
  exports: [CompteCollecteService],
})
export class CompteCollecteModule {}
