import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HistoriquesService } from './historiques.service';
import { CreateHistoriqueDto } from './dto/create-historique.dto';

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
}