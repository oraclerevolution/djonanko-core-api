import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transactions } from './entities/transactions.entity';
import { UpdateResult } from 'typeorm';

@UseGuards(FullAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async createTransaction(
    @Body() payload: CreateTransactionDto,
  ): Promise<Transactions> {
    return await this.transactionsService.createTransaction(payload);
  }

  @Get('merchant-new-clients')
  async getNewClients(@Query('merchantId') merchantId: number): Promise<any> {
    return await this.transactionsService.getNewClients(merchantId);
  }

  @Get('user-transactions')
  async getUserTransactions(@Query('userNumber') userNumber: string) {
    return await this.transactionsService.getUserTransactions(userNumber);
  }

  @Get('get-transaction-by-reference')
  async getTransactionByReference(@Query('reference') reference: string) {
    return await this.transactionsService.getTransactionByReference(reference);
  }

  @Patch('update')
  async update(
    @Query('id') id: string,
    @Body() transaction: Partial<Transactions>,
  ): Promise<UpdateResult> {
    return await this.transactionsService.updateTransaction(id, transaction);
  }
}
