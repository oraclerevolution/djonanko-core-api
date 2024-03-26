import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ForgetPassword } from './entities/forget-password.entity';
import { Between, FindConditions, LessThanOrEqual, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';
import { CreateForgetPasswordDto } from './dto/create-forget.password.dto';
import { GetReclammationsDto } from './dto/get-reclammations.dto';
import { UpdateReclamationStatusDto } from './dto/update-reclamation-status.dto';
import { RateReclammationDto } from './dto/rate-reclammation.dto';

@Injectable()
export class ForgetPasswordService {
    constructor(
        @InjectRepository(ForgetPassword) private readonly repository: Repository<ForgetPassword>,
    ) { }

    async create(payload: CreateForgetPasswordDto): Promise<ForgetPassword> {
        return this.repository.save(payload);
    }

    async findAll(options: GetReclammationsDto): Promise<{ result: ForgetPassword[]; count: number }> {
        let didUpdateFilters = false;
        const where: FindConditions<ForgetPassword> = {};

        const from = options?.from;
        const to = options?.to;
        const status = options?.status;

        if (from && to) {
            where.createdAt = Between(from, to);
            didUpdateFilters = true;
        } else if (from) {
            where.createdAt = MoreThanOrEqual(from);
            didUpdateFilters = true;
        } else if (to) {
            where.createdAt = LessThanOrEqual(to);
            didUpdateFilters = true;
        }

        if (status) {
            where.status = status;
            didUpdateFilters = true;
        }

        if (didUpdateFilters) {
            const response = await this.repository.findAndCount({
                where,
                order: {
                    createdAt: "ASC",
                },
            });

            const result = response[0];
            const count = response[1];

            const data = {
                result,
                count,
            };

            return data;
        }

        const response = await this.repository.findAndCount({
            order: {
                createdAt: "ASC",
            },
        });

        const result = response[0];
        const count = response[1];

        const data = {
            result,
            count,
        };

        return data;
    }

    async updateStatus(
        id: string,
        payload: UpdateReclamationStatusDto
    ): Promise<UpdateResult>{
        return this.repository.update(id, payload);
    }

    async rateReclamation(id: string, payload: RateReclammationDto): Promise<UpdateResult> {
        const getReclamation = await this.repository.findOne({
            where: {
                id
            }
        })

        const reclammationStatus = getReclamation.status;

        if(reclammationStatus === true) {
            return this.repository.update(id, payload);
        }else{
            throw new BadRequestException("Cette reclamation n'a pas encore été validé");
        }
    }

}
