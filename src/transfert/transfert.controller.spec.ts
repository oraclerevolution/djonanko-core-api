import { Test, TestingModule } from '@nestjs/testing';
import { TransfertController } from './transfert.controller';

describe('TransfertController', () => {
  let controller: TransfertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransfertController],
    }).compile();

    controller = module.get<TransfertController>(TransfertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
