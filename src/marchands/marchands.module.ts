import { Module } from '@nestjs/common';
import { MarchandsController } from './marchands.controller';
import { MarchandsService } from './marchands.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marchands } from './entities/marchands.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Marchands
    ])
  ],
  controllers: [MarchandsController],
  providers: [MarchandsService],
})
export class MarchandsModule {}
