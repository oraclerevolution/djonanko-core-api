import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateReferralDto } from './dto/create-referral.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReferralsService {
    constructor(
        @InjectRepository(Referral)
        private readonly referralRepository: Repository<Referral>,
    ) {}

    async createReferral(referral: CreateReferralDto): Promise<Referral> {
        return await this.referralRepository.save(referral);
    }

    async getUserReferrals(userId: number): Promise<Referral[]> {
        return await this.referralRepository.find({
            where: {
                userId
            },
            relations: ['newComer']
        })
    }
    
    async getNewComerParent(user: User): Promise<Referral> {
        return await this.referralRepository.findOne({
            where: {
                newComer: user
            },
        })
    }

    async updateReferral(id: string, referral: CreateReferralDto): Promise<UpdateResult> {
        return await this.referralRepository.update(id, referral)
    }
}
