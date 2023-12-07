import { Test, TestingModule } from '@nestjs/testing';
import { MarchandsService } from './marchands.service';

describe('MarchandsService', () => {
  let service: MarchandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarchandsService],
    }).compile();

    service = module.get<MarchandsService>(MarchandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
