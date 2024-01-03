import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { CreateReferralDto } from './dto/create-referral.dto';

@Controller('referrals')
export class ReferralsController {
    constructor(
        private readonly referralsService: ReferralsService
    ) {}

    @UseGuards(FullAuthGuard)
    @Get('user-referrals')
    async getUserReferrals(
        @Query('id') id: number
    ) {
        return await this.referralsService.getUserReferrals(id)
    }

    @Patch('update-referral-infos')
    async updateReferralInfos(
        @Query('id') id: string,
        @Body() payload: CreateReferralDto
    ){
        return await this.referralsService.updateReferral(id, payload)
    }
}
