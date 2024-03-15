import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { GetMerchantEmployeesDto } from './dto/get-merchant-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeActivityDto } from './dto/employeeActivity.dto';

@UseGuards(FullAuthGuard)
@Controller('employee')
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService
    ) {}

    @Post('create')
    async createEmployee(
        @Body() payload: CreateEmployeeDto,
        @GetUser() user: User
    ): Promise<Employee> {
        return await this.employeeService.create(payload, user);
    }

    @Get('get-merchant-employees')
    async getEmployees(
        @Query("merchantId") merchantId: string,
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

