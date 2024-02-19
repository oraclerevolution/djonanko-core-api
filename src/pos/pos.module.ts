import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Communes } from './entities/communes.entity';
import { Pos } from './entities/pos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Communes, Pos
    ]),
  ],
  controllers: [PosController],
  providers: [PosService]
})
export class PosModule {}
