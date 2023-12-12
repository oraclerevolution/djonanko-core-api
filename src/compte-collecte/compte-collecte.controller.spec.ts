import { Test, TestingModule } from '@nestjs/testing';
import { CompteCollecteController } from './compte-collecte.controller';

describe('CompteCollecteController', () => {
  let controller: CompteCollecteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompteCollecteController],
    }).compile();

    controller = module.get<CompteCollecteController>(CompteCollecteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
