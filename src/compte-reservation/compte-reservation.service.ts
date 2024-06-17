import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompteReservation } from './entities/compte-reservation.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateCompteReservationDto } from './dto/create-compte-reservation.dto';

@Injectable()
export class CompteReservationService {
  constructor(
    @InjectRepository(CompteReservation)
    private readonly repository: Repository<CompteReservation>,
  ) {}

  async createCompteReservation(
    compteReservation: CreateCompteReservationDto,
  ): Promise<CompteReservation> {
    return await this.repository.save(compteReservation);
  }

  async updateCompteReservation(
    id: string,
    compteReservation: Partial<CompteReservation>,
  ): Promise<UpdateResult> {
    return await this.repository.update(id, compteReservation);
  }
}
