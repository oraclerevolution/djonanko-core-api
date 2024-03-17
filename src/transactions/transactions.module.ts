import { Module, forwardRef } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from './entities/transactions.entity';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transactions
    ]),
    EmployeeModule
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService]
})
export class TransactionsModule {}
