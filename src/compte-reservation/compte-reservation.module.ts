import { Module } from '@nestjs/common';
import { CompteReservationController } from './compte-reservation.controller';
import { CompteReservationService } from './compte-reservation.service';

@Module({
  controllers: [CompteReservationController],
  providers: [CompteReservationService]
})
export class CompteReservationModule {}
