import { Bind, Body, Controller, Delete, Get, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MarchandsService } from './marchands.service';
import { CreateMarchandsDto } from './dto/create-marchands.dto';
import { Marchands } from './entities/marchands.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateMarchandDto } from './dto/update-marchands.dto';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';

@Controller('marchands')
export class MarchandsController {
    constructor(
        private readonly marchandsService: MarchandsService
    ) {}

    @Post()
    async createMarchands(
        @Body() marchands: CreateMarchandsDto,
    ): Promise<Marchands> {
        return await this.marchandsService.create(marchands);
    }

    @UseGuards(FullAuthGuard)
    @Get('all-marchands')
    async getAllMarchands(): Promise<Marchands[]> {
        return await this.marchandsService.getAll();
    }

    @UseGuards(FullAuthGuard)
    @Get('marchand/:id')
    async getOneMarchands(@Query('id') id: string): Promise<Marchands> {
        return await this.marchandsService.getOne(id);
    }

    @UseGuards(FullAuthGuard)
    @Get('marchands/category')
    async getMarchantsByCategorieId(
        @Query('id') id: string
    ): Promise<Marchands[]> {
        return await this.marchandsService.getMarchantsByCategorieId(id);
    }

    @UseGuards(FullAuthGuard)
    @Patch('marchand/:id')
    async updateMarchands(
        @Query('id') id: string,
        @Body() marchands: UpdateMarchandDto,
    ): Promise<Marchands> {
        return await this.marchandsService.update(id, marchands);
    }

    @UseGuards(FullAuthGuard)
    @Delete('marchand/:id')
    async deleteMarchands(@Query('id') id: string): Promise<void> {
        await this.marchandsService.delete(id);
    }
}
