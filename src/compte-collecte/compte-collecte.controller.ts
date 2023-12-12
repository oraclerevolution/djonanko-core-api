import { Body, Controller, Post } from '@nestjs/common';
import { CompteCollecteService } from './compte-collecte.service';
import { CreateCollectDto } from './dto/create-collect.dto';

@Controller('compte-collecte')
export class CompteCollecteController {
    constructor(
        private readonly compteCollecteService: CompteCollecteService
    ) {}

    @Post()
    async createCompteCollecte(
        @Body() payload: CreateCollectDto
    ) {
        return await this.compteCollecteService.createCompteCollect(payload)
    }
}
