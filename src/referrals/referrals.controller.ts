import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { ReferralsService } from './referrals.service';
import { Referrals } from './entities/referrals.entity';
import { CreateReferralDto } from './dto/createReferralsDto';

@UseGuards(FullAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('create')
  async createReferral(
    createReferralDto: CreateReferralDto,
  ): Promise<Referrals> {
    return await this.referralsService.createReferral(createReferralDto);
  }

  @Get('all-user-referrals')
  async getAllUserReferrals(userId: number): Promise<Referrals[]> {
    return await this.referralsService.getReferralByUserId(userId);
  }

  @Get('all-referrals')
  async getAllReferrals(): Promise<[Referrals[], number]> {
    return await this.referralsService.getAllReferrals();
  }

  @Get('get-user-referral-points')
  async getUserReferralPoints(userId: number): Promise<string> {
    return await this.referralsService.getReferralPointsByUserId(userId);
  }
}
