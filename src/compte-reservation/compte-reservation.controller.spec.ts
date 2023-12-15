import { Test, TestingModule } from '@nestjs/testing';
import { CompteReservationController } from './compte-reservation.controller';

describe('CompteReservationController', () => {
  let controller: CompteReservationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompteReservationController],
    }).compile();

    controller = module.get<CompteReservationController>(CompteReservationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
