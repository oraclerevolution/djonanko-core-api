import { Module } from '@nestjs/common';
import { CategorieMarchandsController } from './categorie-marchands.controller';
import { CategorieMarchandsService } from './categorie-marchands.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorieMarchands } from './entities/categorie-marchands.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategorieMarchands
    ])
  ],
  controllers: [CategorieMarchandsController],
  providers: [CategorieMarchandsService]
})
export class CategorieMarchandsModule {}
