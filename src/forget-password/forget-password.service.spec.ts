import { Test, TestingModule } from '@nestjs/testing';
import { ForgetPasswordService } from './forget-password.service';

describe('ForgetPasswordService', () => {
  let service: ForgetPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForgetPasswordService],
    }).compile();

    service = module.get<ForgetPasswordService>(ForgetPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
