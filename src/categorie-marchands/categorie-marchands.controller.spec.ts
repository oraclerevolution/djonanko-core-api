import { Test, TestingModule } from '@nestjs/testing';
import { CategorieMarchandsController } from './categorie-marchands.controller';

describe('CategorieMarchandsController', () => {
  let controller: CategorieMarchandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorieMarchandsController],
    }).compile();

    controller = module.get<CategorieMarchandsController>(CategorieMarchandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
