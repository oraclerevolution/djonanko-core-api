import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { ReferralsService } from './referrals.service';
import { Referrals } from './entities/referrals.entity';
import { CreateReferralDto } from './dto/createReferralsDto';
import { UpdateResult } from 'typeorm';

@UseGuards(FullAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('create')
  async createReferral(
    @Body() createReferralDto: CreateReferralDto,
  ): Promise<Referrals> {
    return await this.referralsService.createReferral(createReferralDto);
  }

  @Get('all-user-referrals')
  async getAllUserReferrals(@Query('id') userId: number): Promise<Referrals> {
    return await this.referralsService.getReferralByUserId(userId);
  }

  @Get('all-referrals')
  async getAllReferrals(): Promise<[Referrals[], number]> {
    return await this.referralsService.getAllReferrals();
  }

  @Patch('update')
  async update(
    @Query('id') id: string,
    @Body() payload: Partial<Referrals>,
  ): Promise<UpdateResult> {
    return await this.referralsService.updateReferral(id, payload);
  }
}
