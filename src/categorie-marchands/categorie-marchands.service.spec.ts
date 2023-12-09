import { Test, TestingModule } from '@nestjs/testing';
import { CategorieMarchandsService } from './categorie-marchands.service';

describe('CategorieMarchandsService', () => {
  let service: CategorieMarchandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorieMarchandsService],
    }).compile();

    service = module.get<CategorieMarchandsService>(CategorieMarchandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
