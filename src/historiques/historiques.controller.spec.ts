import { Test, TestingModule } from '@nestjs/testing';
import { HistoriquesController } from './historiques.controller';

describe('HistoriquesController', () => {
  let controller: HistoriquesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriquesController],
    }).compile();

    controller = module.get<HistoriquesController>(HistoriquesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
