import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompteReservationService } from './compte-reservation.service';
import { CompteReservation } from './entities/compte-reservation.entity';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';

@UseGuards(FullAuthGuard)
@Controller('compte-reservation')
export class CompteReservationController {
  constructor(
    private readonly compteReservationService: CompteReservationService,
  ) {}

  @Post('create')
  async create(@Body() payload: Partial<CompteReservation>) {
    return this.compteReservationService.createCompteReservation(payload);
  }

  @Patch('update')
  async update(
    @Query('id') id: string,
    @Body() payload: Partial<CompteReservation>,
  ) {
    return this.compteReservationService.updateCompteReservation(id, payload);
  }
}
