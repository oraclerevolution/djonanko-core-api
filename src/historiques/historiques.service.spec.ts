import { Test, TestingModule } from '@nestjs/testing';
import { HistoriquesService } from './historiques.service';

describe('HistoriquesService', () => {
  let service: HistoriquesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoriquesService],
    }).compile();

    service = module.get<HistoriquesService>(HistoriquesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
