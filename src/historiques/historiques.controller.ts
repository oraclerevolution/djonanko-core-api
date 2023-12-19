import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { HistoriquesService } from './historiques.service';
import { CreateHistoriqueDto } from './dto/create-historique.dto';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(FullAuthGuard)
@Controller('historiques')
export class HistoriquesController {
    constructor(
        private readonly historiquesService: HistoriquesService
    ) {}

    @Post()
    async createHistorique(
        @Body() historique: CreateHistoriqueDto
    ){
        return await this.historiquesService.createHistorique(historique)
    }

    @Get()
    async getAUserHistorique(
        @Query('id') id: number
    ){
        return await this.historiquesService.getAUserHistorique(id)
    }

    @Get('all-historique')
    async getAllHistoriques(
        @Query('id') id: number
    ){
        return await this.historiquesService.getAllHistoriques(id)
    }

    @Get('historique-filter')
    async getTransfertHistorique(
        @Query('id') userId: number,
        @Query('month') month: number,
        @Query('type') type: string,
    ){
        return await this.historiquesService.getTransfertHistoriqueFilters({
            userId,
            type,
            month
        })
    }

    @Get('details-historique')
    async getHistoriqueDetails(
        @Query('id') id: string,
    ){
        return await this.historiquesService.getOneHistorique(id)
    }
}
