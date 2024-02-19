import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PosService } from './pos.service';
import { CreateCommuneDto } from './dto/create-commune.dto';
import { Communes } from './entities/communes.entity';
import { CreatePosDto } from './dto/create-pos.dto';
import { Pos } from './entities/pos.entity';

@Controller('pos')
export class PosController {
    constructor(
        private readonly posService: PosService
    ) {}

    @Post('create-commune')
    async createCommune(
        @Body() payload: CreateCommuneDto
    ): Promise<Communes> {
        return await this.posService.createCommunes(payload);
    }

    @Post('create-pos')
    async createPos(
        @Body() payload: CreatePosDto
    ): Promise<Pos> {
        return await this.posService.create(payload);
    }

    @Get('search-pos-by-commune')
    async searchPosByCommune(
        @Query('name') name: string
    ): Promise<Pos[]> {
        return await this.posService.searchPosByCommune(name);
    }

    @Get('get-all-commune')
    async getACommune(){
        return await this.posService.getAllCommune();
    }
}
