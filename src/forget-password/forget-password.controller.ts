import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { ForgetPasswordService } from './forget-password.service';
import { ForgetPassword } from './entities/forget-password.entity';
import { parseISO } from 'date-fns';
import { CreateForgetPasswordDto } from './dto/create-forget.password.dto';
import { UpdateReclamationStatusDto } from './dto/update-reclamation-status.dto';
import { UpdateResult } from 'typeorm';
import { RateReclammationDto } from './dto/rate-reclammation.dto';

@UseGuards(FullAuthGuard)
@Controller('forget-password')
export class ForgetPasswordController {
    constructor(
        private forgetPasswordService: ForgetPasswordService
    ) { }

    @Post('create')
    async create(@Body() forgetPassword: CreateForgetPasswordDto): Promise<ForgetPassword> {
        return this.forgetPasswordService.create(forgetPassword);
    }

    @Get('all-reclamation')
    async findAll(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('status') status: boolean 
    ): Promise<{ result: ForgetPassword[]; count: number }> {
        let parseFrom: Date;
        let parseTo: Date;

        if (from) {
            try {
                parseFrom = parseISO(from);
            } catch (error) {
                console.log(error);
            }
        }

        if (to) {
            try {
                parseTo = parseISO(to);
            } catch (error) {
                console.log(error);
            }
        }

        return this.forgetPasswordService.findAll({from: parseFrom, to: parseTo, status});
    }

    @Patch('update-status')
    async updateStatus(
        @Query('id') id: string,
        @Body() payload: UpdateReclamationStatusDto): Promise<UpdateResult> {
        return this.forgetPasswordService.updateStatus(id,payload);
    }

    @Patch('rate-reclamation')
    async rateReclamation(
        @Query('id') id: string,
        @Body() payload: RateReclammationDto
    ): Promise<UpdateResult> {
        return this.forgetPasswordService.rateReclamation(id, payload)
    }
}
