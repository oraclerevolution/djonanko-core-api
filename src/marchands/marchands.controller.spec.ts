import { Test, TestingModule } from '@nestjs/testing';
import { MarchandsController } from './marchands.controller';

describe('MarchandsController', () => {
  let controller: MarchandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarchandsController],
    }).compile();

    controller = module.get<MarchandsController>(MarchandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
