import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Referrals } from './entities/referrals.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CreateReferralDto } from './dto/createReferralsDto';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referrals)
    private readonly repository: Repository<Referrals>,
    private readonly userService: UserService,
  ) {}

  async createReferral(payload: CreateReferralDto): Promise<Referrals> {
    return await this.repository.save(payload);
  }

  async getReferralByUserId(userId: number): Promise<Referrals[]> {
    return await this.repository.find({
      where: {
        userId,
      },
    });
  }

  async getAllReferrals(): Promise<[Referrals[], number]> {
    return await this.repository.findAndCount();
  }

  async getReferralPointsByUserId(userId: number): Promise<string> {
    const user = await this.userService.getUserById(userId);
    return user.referralAmountToPoint;
  }
}
