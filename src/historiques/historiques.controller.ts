import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HistoriquesService } from './historiques.service';
import { CreateHistoriqueDto } from './dto/create-historique.dto';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { UpdateHistoriqueDto } from './dto/update-historique.dto';

@UseGuards(FullAuthGuard)
@Controller('historiques')
export class HistoriquesController {
  constructor(private readonly historiquesService: HistoriquesService) {}

  @Post()
  async createHistorique(@Body() historique: CreateHistoriqueDto) {
    return await this.historiquesService.createHistorique(historique);
  }

  @Get()
  async getAUserHistorique(@Query('id') id: number) {
    return await this.historiquesService.getAUserHistorique(id);
  }

  @Get('all-historique')
  async getAllHistoriques(@Query('id') id: number) {
    return await this.historiquesService.getAllHistoriques(id);
  }

  @Get('historique-filter')
  async getTransfertHistorique(
    @Query('id') userId: number,
    @Query('month') month: number,
    @Query('type') type: string,
  ) {
    return await this.historiquesService.getTransfertHistoriqueFilters({
      userId,
      type,
      month,
    });
  }

  @Get('get-historique-by-reference')
  async getHistoriqueByReference(@Query('reference') reference: string) {
    return await this.historiquesService.getHistoriqueByReference(reference);
  }

  @Get('details-historique')
  async getHistoriqueDetails(@Query('id') id: string) {
    return await this.historiquesService.getOneHistorique(id);
  }

  @Get('total-spent')
  async getTotalSpent(@Query('id') id: number, @Query('month') month: number) {
    return await this.historiquesService.getTotalSpentForThisMonth(id, month);
  }

  @Get('total-received')
  async getTotalReceived(
    @Query('id') id: number,
    @Query('month') month: number,
  ) {
    return await this.historiquesService.getTotalReceivedForThisMonth(
      id,
      month,
    );
  }

  @Patch('update-historique')
  async updateHistorique(
    @Body() historique: UpdateHistoriqueDto,
    @Query('id') id: string,
  ) {
    return await this.historiquesService.updateHistorique(id, historique);
  }
}
