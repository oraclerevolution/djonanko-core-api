import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategorieMarchandsService } from './categorie-marchands.service';
import { CategorieMarchands } from './entities/categorie-marchands.entity';
import { RetrieveMerchantsCategoryDto } from './dto/retrieve-merchants-category.dto';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';

@UseGuards(FullAuthGuard)
@Controller('categorie-marchands')
export class CategorieMarchandsController {
    constructor(
        private readonly categorieMarchandsService: CategorieMarchandsService
    ) {}

    @Post()
    async createCategorieMarchands(
        @Body() marchand: CategorieMarchands
    ): Promise<CategorieMarchands> {
        return await this.categorieMarchandsService.create(marchand);
    }

    @Get('all-categories')
    async getAllCategorieMarchands(): Promise<RetrieveMerchantsCategoryDto> {
        return await this.categorieMarchandsService.getAll();
    }

    @Get('category/:id')
    async getOneCategorieMarchands(@Query('id') id: string): Promise<CategorieMarchands> {
        return await this.categorieMarchandsService.getOne(id);
    }

    @Patch('category/:id')
    async updateCategorieMarchands(
        @Query('id') id: string,
        @Body() marchand: CategorieMarchands
    ){
        return await this.categorieMarchandsService.update(id, marchand)
    }

    @Delete('category/:id')
    async deleteCategorieMarchands(@Query('id') id: string): Promise<void> {
        await this.categorieMarchandsService.delete(id);
    }
}
