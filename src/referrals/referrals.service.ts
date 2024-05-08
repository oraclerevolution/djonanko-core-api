import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Referrals } from './entities/referrals.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateReferralDto } from './dto/createReferralsDto';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referrals)
    private readonly repository: Repository<Referrals>,
  ) {}

  async createReferral(payload: CreateReferralDto): Promise<Referrals> {
    return await this.repository.save(payload);
  }

  async getReferralByUserId(userId: number): Promise<Referrals> {
    return await this.repository.findOne({
      where: {
        guessId: userId,
      },
    });
  }

  async getAllReferrals(): Promise<[Referrals[], number]> {
    return await this.repository.findAndCount();
  }

  async updateReferral(
    id: string,
    payload: Partial<Referrals>,
  ): Promise<UpdateResult> {
    return await this.repository.update(id, payload);
  }
}
