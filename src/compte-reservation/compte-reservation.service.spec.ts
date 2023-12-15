import { Test, TestingModule } from '@nestjs/testing';
import { CompteReservationService } from './compte-reservation.service';

describe('CompteReservationService', () => {
  let service: CompteReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompteReservationService],
    }).compile();

    service = module.get<CompteReservationService>(CompteReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
