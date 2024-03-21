import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { GetMerchantEmployeesDto } from './dto/get-merchant-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeActivityDto } from './dto/employeeActivity.dto';
import { DailyTransactionsReturnDto } from './dto/daily-transactions-return.dto';
import { GetEmployeeTotalAmountReturnDto } from './dto/get-employee-total-amount-return.dto';
import { UserService } from 'src/user/user.service';

@UseGuards(FullAuthGuard)
@Controller('employee')
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
        private readonly usersService: UserService
    ) {}

    @Post('create')
    async createEmployee(
        @Body() payload: CreateEmployeeDto,
        @GetUser() user: User
    ): Promise<Employee> {
        const getUser = await this.usersService.getUserByPhoneNumber(payload.phoneNumber);
        if(!getUser) throw new BadRequestException("Ce numéro n'est pas valide");
        return await this.employeeService.create(payload, user);
    }

    @Get('get-merchant-employees')
    async getEmployees(
        @Query("merchantId") merchantId: number,
    ): Promise<GetMerchantEmployeesDto> {
        return await this.employeeService.getEmployees(merchantId);
    }

    @Patch('block-employee')
    async blockEmployee(@Query('id') id: number): Promise<void> {
        await this.employeeService.blockEmployee(id);
    }

    @Get('employee-activity')
    async getAnEmployeeActivity(@Query('employeeId') id: string): Promise<EmployeeActivityDto> {
        return await this.employeeService.getAnEmployeeActivity(id);
    }

    @Get('get-all-employees-activity')
    async getEmployeesActivity(
        @Query('merchantId') merchantId: number
    ): Promise<GetEmployeeTotalAmountReturnDto> {
        return await this.employeeService.getAllEmployeesActivity(merchantId);
    }

    @Get('calculate-daily-transactions')
    async calculateDailyTransactions(@Query('merchantId') merchantId: number): Promise<DailyTransactionsReturnDto[]> {
        return await this.employeeService.calculateDailyTransactions(merchantId);
    }

    @Get('merchant-employee')
    async merchantEmployees(
        @Query('merchantId') merchantId: number
    ): Promise<Employee[]>{
        return await this.employeeService.getMerchantEmployee(merchantId)
    }

    @Patch('update')
    async updateMarchands(
        @Query('id') id: string,
        @Body() payload: UpdateEmployeeDto
    ): Promise<Employee> {
        return await this.employeeService.update(id, payload);
    }

    @Delete('delete')
    async deleteMarchands(@Query('id') id: string): Promise<void> {
        await this.employeeService.delete(id);
    }
}

