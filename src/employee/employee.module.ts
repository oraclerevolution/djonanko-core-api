import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { UserModule } from 'src/user/user.module';
import { PaiementModule } from 'src/paiement/paiement.module';
import { TransfertModule } from 'src/transfert/transfert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee
    ]), 
    UserModule,
    PaiementModule,
    TransfertModule
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, FullAuthGuard],
  exports: [EmployeeService]
})
export class EmployeeModule {}
