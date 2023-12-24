import { Module } from '@nestjs/common';
import { CompteReservationController } from './compte-reservation.controller';
import { CompteReservationService } from './compte-reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompteReservation } from './entities/compte-reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompteReservation])],
  controllers: [CompteReservationController],
  providers: [CompteReservationService],
  exports: [CompteReservationService],
})
export class CompteReservationModule {}
