import { Test, TestingModule } from '@nestjs/testing';
import { CompteCollecteService } from './compte-collecte.service';

describe('CompteCollecteService', () => {
  let service: CompteCollecteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompteCollecteService],
    }).compile();

    service = module.get<CompteCollecteService>(CompteCollecteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
